import { SavedAppliance, MaintenanceSchedule, ApplianceRepairRecord, MaintenanceReminder } from '@/types';
import { parseJSONSafely } from './utils';

const APPLIANCES_KEY = 'repairiq_appliances';
const MAINTENANCE_KEY = 'repairiq_maintenance_schedules';
const REMINDERS_KEY = 'repairiq_reminders';

// Appliance CRUD operations
export function getSavedAppliances(): SavedAppliance[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(APPLIANCES_KEY);
  return parseJSONSafely<SavedAppliance[]>(data || '[]', []);
}

export function getAppliance(id: string): SavedAppliance | null {
  const appliances = getSavedAppliances();
  return appliances.find(a => a.id === id) || null;
}

export function saveAppliance(appliance: SavedAppliance): void {
  if (typeof window === 'undefined') return;
  const appliances = getSavedAppliances();
  const existingIndex = appliances.findIndex(a => a.id === appliance.id);

  if (existingIndex >= 0) {
    appliances[existingIndex] = { ...appliance, updatedAt: new Date() };
  } else {
    appliances.unshift(appliance);
  }

  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));
}

export function deleteAppliance(id: string): void {
  if (typeof window === 'undefined') return;
  const appliances = getSavedAppliances().filter(a => a.id !== id);
  localStorage.setItem(APPLIANCES_KEY, JSON.stringify(appliances));

  // Also delete associated maintenance schedules and reminders
  deleteMaintenanceSchedulesForAppliance(id);
}

// Search appliances
export function searchAppliances(query: string): SavedAppliance[] {
  const appliances = getSavedAppliances();
  const lowerQuery = query.toLowerCase();

  return appliances.filter(a =>
    a.name.toLowerCase().includes(lowerQuery) ||
    a.nickname?.toLowerCase().includes(lowerQuery) ||
    a.brand.toLowerCase().includes(lowerQuery) ||
    a.model.toLowerCase().includes(lowerQuery) ||
    a.type.toLowerCase().includes(lowerQuery)
  );
}

// Repair history management
export function addRepairRecord(applianceId: string, record: ApplianceRepairRecord): void {
  const appliance = getAppliance(applianceId);
  if (!appliance) return;

  appliance.repairHistory = appliance.repairHistory || [];
  appliance.repairHistory.unshift(record);
  appliance.lastMaintenanceDate = record.date;

  saveAppliance(appliance);
}

export function getRepairHistory(applianceId: string): ApplianceRepairRecord[] {
  const appliance = getAppliance(applianceId);
  return appliance?.repairHistory || [];
}

export function getAllRepairHistory(): ApplianceRepairRecord[] {
  const appliances = getSavedAppliances();
  const allHistory: ApplianceRepairRecord[] = [];

  appliances.forEach(appliance => {
    if (appliance.repairHistory) {
      allHistory.push(...appliance.repairHistory);
    }
  });

  return allHistory.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Maintenance schedules
export function getMaintenanceSchedules(): MaintenanceSchedule[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MAINTENANCE_KEY);
  return parseJSONSafely<MaintenanceSchedule[]>(data || '[]', []);
}

export function saveMaintenanceSchedule(schedule: MaintenanceSchedule): void {
  if (typeof window === 'undefined') return;
  const schedules = getMaintenanceSchedules();
  const existingIndex = schedules.findIndex(s => s.id === schedule.id);

  if (existingIndex >= 0) {
    schedules[existingIndex] = schedule;
  } else {
    schedules.push(schedule);
  }

  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(schedules));
}

export function deleteMaintenanceSchedule(id: string): void {
  if (typeof window === 'undefined') return;
  const schedules = getMaintenanceSchedules().filter(s => s.id !== id);
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(schedules));
}

export function deleteMaintenanceSchedulesForAppliance(applianceId: string): void {
  if (typeof window === 'undefined') return;
  const schedules = getMaintenanceSchedules().filter(s => s.applianceId !== applianceId);
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(schedules));
}

export function completeMaintenanceTask(scheduleId: string): void {
  const schedules = getMaintenanceSchedules();
  const schedule = schedules.find(s => s.id === scheduleId);

  if (schedule) {
    schedule.lastCompleted = new Date();
    // Calculate next due date
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + schedule.intervalMonths);
    schedule.nextDue = nextDue;

    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(schedules));
  }
}

// Get upcoming maintenance reminders
export function getMaintenanceReminders(): MaintenanceReminder[] {
  const schedules = getMaintenanceSchedules();
  const appliances = getSavedAppliances();
  const now = new Date();

  return schedules
    .filter(s => s.reminderEnabled)
    .map(schedule => {
      const appliance = appliances.find(a => a.id === schedule.applianceId);
      const dueDate = new Date(schedule.nextDue);
      const isOverdue = dueDate < now;

      // Determine priority based on how overdue
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let priority: 'low' | 'medium' | 'high' = 'low';
      if (isOverdue) priority = 'high';
      else if (daysUntilDue <= 7) priority = 'medium';

      return {
        id: schedule.id,
        applianceId: schedule.applianceId,
        applianceName: appliance?.nickname || appliance?.name || 'Unknown Appliance',
        taskName: schedule.taskName,
        description: schedule.description,
        dueDate,
        isOverdue,
        priority,
        dismissed: false,
      };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Warranty checking
export function checkWarrantyStatus(applianceId: string): {
  isUnderWarranty: boolean;
  warrantyType: 'manufacturer' | 'extended' | 'none';
  daysRemaining: number | null;
  expirationDate: Date | null;
} {
  const appliance = getAppliance(applianceId);
  if (!appliance) {
    return { isUnderWarranty: false, warrantyType: 'none', daysRemaining: null, expirationDate: null };
  }

  const now = new Date();

  // Check extended warranty first
  if (appliance.extendedWarrantyExpiration) {
    const extExpDate = new Date(appliance.extendedWarrantyExpiration);
    if (extExpDate > now) {
      const daysRemaining = Math.ceil((extExpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isUnderWarranty: true, warrantyType: 'extended', daysRemaining, expirationDate: extExpDate };
    }
  }

  // Check manufacturer warranty
  if (appliance.warrantyExpiration) {
    const mfgExpDate = new Date(appliance.warrantyExpiration);
    if (mfgExpDate > now) {
      const daysRemaining = Math.ceil((mfgExpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { isUnderWarranty: true, warrantyType: 'manufacturer', daysRemaining, expirationDate: mfgExpDate };
    }
  }

  return { isUnderWarranty: false, warrantyType: 'none', daysRemaining: null, expirationDate: null };
}

// Get appliances expiring soon (within 30 days)
export function getAppliancesWithExpiringWarranty(): SavedAppliance[] {
  const appliances = getSavedAppliances();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return appliances.filter(appliance => {
    const status = checkWarrantyStatus(appliance.id);
    return status.isUnderWarranty && status.expirationDate && status.expirationDate <= thirtyDaysFromNow;
  });
}

// Statistics and trends
export function getRepairStats(): {
  totalRepairs: number;
  totalSpent: number;
  successRate: number;
  avgCostPerRepair: number;
  mostRepairedType: string | null;
  mostRepairedBrand: string | null;
} {
  const allHistory = getAllRepairHistory();

  if (allHistory.length === 0) {
    return {
      totalRepairs: 0,
      totalSpent: 0,
      successRate: 0,
      avgCostPerRepair: 0,
      mostRepairedType: null,
      mostRepairedBrand: null,
    };
  }

  const totalRepairs = allHistory.length;
  const totalSpent = allHistory.reduce((sum, r) => sum + (r.cost || 0), 0);
  const successfulRepairs = allHistory.filter(r => r.wasSuccessful).length;

  // Find most repaired type and brand
  const appliances = getSavedAppliances();
  const typeCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};

  allHistory.forEach(record => {
    const appliance = appliances.find(a => a.id === record.applianceId);
    if (appliance) {
      typeCounts[appliance.type] = (typeCounts[appliance.type] || 0) + 1;
      brandCounts[appliance.brand] = (brandCounts[appliance.brand] || 0) + 1;
    }
  });

  const mostRepairedType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostRepairedBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalRepairs,
    totalSpent,
    successRate: Math.round((successfulRepairs / totalRepairs) * 100),
    avgCostPerRepair: Math.round(totalSpent / totalRepairs),
    mostRepairedType,
    mostRepairedBrand,
  };
}

// Default maintenance schedules by appliance type
export const DEFAULT_MAINTENANCE_SCHEDULES: Record<string, Array<{ taskName: string; description: string; intervalMonths: number }>> = {
  refrigerator: [
    { taskName: 'Clean condenser coils', description: 'Vacuum or brush the condenser coils to maintain efficiency', intervalMonths: 6 },
    { taskName: 'Replace water filter', description: 'Replace the water/ice filter for clean water', intervalMonths: 6 },
    { taskName: 'Clean door gaskets', description: 'Wipe door seals with mild soap to maintain seal', intervalMonths: 3 },
    { taskName: 'Check temperature settings', description: 'Verify fridge is at 37-40°F, freezer at 0°F', intervalMonths: 3 },
  ],
  washer: [
    { taskName: 'Clean washer drum', description: 'Run cleaning cycle or use washer cleaner', intervalMonths: 1 },
    { taskName: 'Clean dispenser drawer', description: 'Remove and clean detergent/softener dispenser', intervalMonths: 1 },
    { taskName: 'Check inlet hoses', description: 'Inspect water inlet hoses for cracks or bulges', intervalMonths: 12 },
    { taskName: 'Clean door gasket', description: 'Wipe front-load door seal to prevent mold', intervalMonths: 1 },
  ],
  dryer: [
    { taskName: 'Clean lint trap', description: 'Remove lint from trap after every use', intervalMonths: 0 },
    { taskName: 'Deep clean exhaust vent', description: 'Clean entire vent duct from dryer to outside', intervalMonths: 12 },
    { taskName: 'Inspect drum seals', description: 'Check for wear on front and rear drum seals', intervalMonths: 12 },
  ],
  dishwasher: [
    { taskName: 'Clean filter', description: 'Remove and clean the dishwasher filter', intervalMonths: 1 },
    { taskName: 'Run cleaning cycle', description: 'Run empty cycle with dishwasher cleaner', intervalMonths: 1 },
    { taskName: 'Clean spray arms', description: 'Check and clear spray arm holes', intervalMonths: 3 },
    { taskName: 'Inspect door gasket', description: 'Clean door seal and check for damage', intervalMonths: 3 },
  ],
  hvac: [
    { taskName: 'Replace air filter', description: 'Replace HVAC air filter', intervalMonths: 3 },
    { taskName: 'Professional inspection', description: 'Schedule annual professional HVAC tune-up', intervalMonths: 12 },
    { taskName: 'Clean vents', description: 'Vacuum supply and return vents', intervalMonths: 6 },
    { taskName: 'Check thermostat', description: 'Test thermostat accuracy and replace batteries', intervalMonths: 12 },
  ],
  'water heater': [
    { taskName: 'Flush tank', description: 'Drain and flush sediment from tank', intervalMonths: 12 },
    { taskName: 'Test pressure relief valve', description: 'Test T&P valve operation for safety', intervalMonths: 12 },
    { taskName: 'Check anode rod', description: 'Inspect anode rod for corrosion', intervalMonths: 24 },
  ],
};

// Create default maintenance schedules for an appliance
export function createDefaultMaintenanceSchedules(appliance: SavedAppliance): MaintenanceSchedule[] {
  const typeKey = appliance.type.toLowerCase();
  const templates = DEFAULT_MAINTENANCE_SCHEDULES[typeKey] || [];

  return templates
    .filter(t => t.intervalMonths > 0) // Skip items with 0 interval (like lint trap - every use)
    .map((template, index) => {
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + template.intervalMonths);

      return {
        id: `${appliance.id}-maint-${index}`,
        applianceId: appliance.id,
        taskName: template.taskName,
        description: template.description,
        intervalMonths: template.intervalMonths,
        nextDue,
        reminderEnabled: true,
      };
    });
}
