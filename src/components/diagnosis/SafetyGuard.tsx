'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult, Difficulty } from '@/types';
import {
  Shield,
  X,
  AlertTriangle,
  Phone,
  Zap,
  Flame,
  Droplets,
  Wind,
  CheckCircle,
  Info,
  ExternalLink,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyGuardProps {
  result: DiagnosisResult;
  isOpen: boolean;
  onClose: () => void;
}

interface SafetyAlert {
  id: string;
  type: 'electrical' | 'gas' | 'water' | 'chemical' | 'physical' | 'general';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  action: string;
}

const EMERGENCY_CONTACTS = [
  { name: '911 Emergency', number: '911', icon: Phone, description: 'Life-threatening emergency' },
  { name: 'Poison Control', number: '1-800-222-1222', icon: AlertCircle, description: 'Chemical exposure or ingestion' },
  { name: 'Gas Leak Hotline', number: '911', icon: Flame, description: 'If you smell gas, leave immediately' },
];

const SAFETY_BY_TYPE: Record<string, SafetyAlert[]> = {
  electrical: [
    {
      id: 'elec-1',
      type: 'electrical',
      severity: 'danger',
      title: 'Disconnect Power First',
      description: 'ALWAYS unplug the appliance or turn off the circuit breaker before starting any repair.',
      action: 'Unplug or flip breaker OFF',
    },
    {
      id: 'elec-2',
      type: 'electrical',
      severity: 'warning',
      title: 'Verify Power is Off',
      description: 'Use a multimeter or non-contact voltage tester to confirm no power is flowing.',
      action: 'Test with voltage tester',
    },
    {
      id: 'elec-3',
      type: 'electrical',
      severity: 'info',
      title: 'Watch for Capacitors',
      description: 'Some appliances have capacitors that store charge even when unplugged. Allow time to discharge.',
      action: 'Wait 5 minutes after unplugging',
    },
  ],
  water: [
    {
      id: 'water-1',
      type: 'water',
      severity: 'warning',
      title: 'Shut Off Water Supply',
      description: 'Turn off water supply valves before disconnecting any water lines.',
      action: 'Turn supply valves clockwise',
    },
    {
      id: 'water-2',
      type: 'water',
      severity: 'info',
      title: 'Prepare for Water Release',
      description: 'Have towels and a bucket ready - residual water will drain when disconnecting hoses.',
      action: 'Place towels and bucket below',
    },
  ],
  gas: [
    {
      id: 'gas-1',
      type: 'gas',
      severity: 'danger',
      title: 'Turn Off Gas Supply',
      description: 'CRITICAL: Turn off the gas supply valve before any work on gas appliances.',
      action: 'Turn gas valve perpendicular to pipe',
    },
    {
      id: 'gas-2',
      type: 'gas',
      severity: 'danger',
      title: 'No Open Flames',
      description: 'Never use lighters, matches, or create sparks near gas appliances being repaired.',
      action: 'Remove all ignition sources',
    },
    {
      id: 'gas-3',
      type: 'gas',
      severity: 'danger',
      title: 'Smell Gas? Leave Now',
      description: 'If you smell rotten eggs, leave immediately. Do NOT turn on lights or use phones indoors.',
      action: 'Evacuate and call 911 from outside',
    },
  ],
  general: [
    {
      id: 'gen-1',
      type: 'general',
      severity: 'warning',
      title: 'Wear Protective Gear',
      description: 'Use safety glasses and work gloves to protect against sharp edges and debris.',
      action: 'Put on gloves and glasses',
    },
    {
      id: 'gen-2',
      type: 'general',
      severity: 'info',
      title: 'Clear Your Workspace',
      description: 'Make sure you have adequate lighting and clear space around the appliance.',
      action: 'Set up workspace and lighting',
    },
    {
      id: 'gen-3',
      type: 'general',
      severity: 'info',
      title: 'Take Photos Before Starting',
      description: 'Photograph wire connections and part positions before removing anything.',
      action: 'Photo all connections first',
    },
  ],
};

function getSafetyAlerts(result: DiagnosisResult): SafetyAlert[] {
  const alerts: SafetyAlert[] = [...SAFETY_BY_TYPE.general];
  const itemType = result.itemType.toLowerCase();

  // Add electrical safety for all appliances
  alerts.unshift(...SAFETY_BY_TYPE.electrical);

  // Add water safety for washers, dishwashers, water heaters
  if (['washer', 'dishwasher', 'water heater', 'refrigerator'].some(t => itemType.includes(t))) {
    alerts.push(...SAFETY_BY_TYPE.water);
  }

  // Add gas safety for gas appliances
  if (['oven', 'range', 'stove', 'furnace', 'water heater', 'dryer'].some(t => itemType.includes(t))) {
    alerts.push(...SAFETY_BY_TYPE.gas);
  }

  // Sort by severity
  const severityOrder = { danger: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function SafetyGuard({ result, isOpen, onClose }: SafetyGuardProps) {
  const [checkedAlerts, setCheckedAlerts] = useState<Set<string>>(new Set());
  const [showEmergency, setShowEmergency] = useState(false);

  const alerts = getSafetyAlerts(result);
  const dangerAlerts = alerts.filter(a => a.severity === 'danger');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  const allDangerChecked = dangerAlerts.every(a => checkedAlerts.has(a.id));
  const allChecked = alerts.every(a => checkedAlerts.has(a.id));

  const toggleAlert = (alertId: string) => {
    setCheckedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'electrical': return Zap;
      case 'gas': return Flame;
      case 'water': return Droplets;
      case 'chemical': return AlertCircle;
      default: return Shield;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'danger': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700',
      };
      case 'warning': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
      };
      default: return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
      };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">
                    Safety Checklist
                  </h2>
                  <p className="text-sm text-surface-500">
                    Complete before starting your repair
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Phone className="w-4 h-4" />}
                  onClick={() => setShowEmergency(!showEmergency)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Emergency
                </Button>
                <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <AnimatePresence>
              {showEmergency && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Emergency Contacts
                    </h3>
                    <div className="space-y-2">
                      {EMERGENCY_CONTACTS.map((contact) => (
                        <a
                          key={contact.name}
                          href={`tel:${contact.number}`}
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <contact.icon className="w-5 h-5 text-red-600" />
                            <div>
                              <p className="font-medium text-surface-900">{contact.name}</p>
                              <p className="text-xs text-surface-500">{contact.description}</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-red-600">{contact.number}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-surface-600">Safety checklist progress</span>
                <span className="font-medium">
                  {checkedAlerts.size}/{alerts.length} checked
                </span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    allChecked ? 'bg-green-500' : allDangerChecked ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  animate={{ width: `${(checkedAlerts.size / alerts.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Danger Alerts */}
            {dangerAlerts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Safety Steps
                </h3>
                <div className="space-y-2">
                  {dangerAlerts.map((alert) => {
                    const styles = getSeverityStyles(alert.severity);
                    const TypeIcon = getTypeIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all cursor-pointer',
                          checkedAlerts.has(alert.id) ? 'border-green-300 bg-green-50/50' : `${styles.border} ${styles.bg}`
                        )}
                        onClick={() => toggleAlert(alert.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5',
                            checkedAlerts.has(alert.id) ? 'bg-green-500' : styles.badge
                          )}>
                            {checkedAlerts.has(alert.id) ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <TypeIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={cn(
                              'font-medium',
                              checkedAlerts.has(alert.id) ? 'text-green-700 line-through' : 'text-surface-900'
                            )}>
                              {alert.title}
                            </h4>
                            <p className="text-sm text-surface-600 mt-0.5">{alert.description}</p>
                            <div className="mt-2">
                              <Badge variant="outline" size="sm">
                                {alert.action}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warning Alerts */}
            {warningAlerts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Important Precautions
                </h3>
                <div className="space-y-2">
                  {warningAlerts.map((alert) => {
                    const styles = getSeverityStyles(alert.severity);
                    const TypeIcon = getTypeIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          'p-3 rounded-xl border cursor-pointer transition-all',
                          checkedAlerts.has(alert.id) ? 'border-green-200 bg-green-50/50' : `${styles.border} ${styles.bg}`
                        )}
                        onClick={() => toggleAlert(alert.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                            checkedAlerts.has(alert.id) ? 'bg-green-500' : styles.badge
                          )}>
                            {checkedAlerts.has(alert.id) ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : (
                              <TypeIcon className="w-3 h-3" />
                            )}
                          </div>
                          <div>
                            <span className={cn(
                              'font-medium text-sm',
                              checkedAlerts.has(alert.id) && 'line-through text-surface-500'
                            )}>
                              {alert.title}
                            </span>
                            <span className="text-sm text-surface-500"> - {alert.action}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Alerts */}
            {infoAlerts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Best Practices
                </h3>
                <div className="space-y-2">
                  {infoAlerts.map((alert) => {
                    const TypeIcon = getTypeIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          'p-3 rounded-xl border cursor-pointer transition-all',
                          checkedAlerts.has(alert.id)
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-blue-200 bg-blue-50'
                        )}
                        onClick={() => toggleAlert(alert.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                            checkedAlerts.has(alert.id) ? 'bg-green-500' : 'bg-blue-100 text-blue-700'
                          )}>
                            {checkedAlerts.has(alert.id) ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : (
                              <TypeIcon className="w-3 h-3" />
                            )}
                          </div>
                          <span className={cn(
                            'text-sm',
                            checkedAlerts.has(alert.id) && 'line-through text-surface-500'
                          )}>
                            <span className="font-medium">{alert.title}</span>
                            <span className="text-surface-500"> - {alert.action}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action */}
            <div className={cn(
              'p-4 rounded-xl text-center',
              allChecked ? 'bg-green-50' : allDangerChecked ? 'bg-amber-50' : 'bg-red-50'
            )}>
              {allChecked ? (
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">All safety checks complete! You're ready to start.</span>
                </div>
              ) : allDangerChecked ? (
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Critical steps done. Complete remaining checks for best safety.</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Complete all critical safety steps before starting repair.</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={onClose}
                disabled={!allDangerChecked}
              >
                {allDangerChecked ? 'Proceed to Repair' : 'Complete Critical Steps First'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SafetyGuard;
