'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { SavedAppliance, MaintenanceSchedule } from '@/types';
import {
  getSavedAppliances,
  saveAppliance,
  deleteAppliance,
  checkWarrantyStatus,
  createDefaultMaintenanceSchedules,
  saveMaintenanceSchedule,
  getMaintenanceReminders,
} from '@/lib/applianceStorage';
import { generateId } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Box,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  ChevronRight,
  Home,
  Tag,
  FileText,
  Bell,
} from 'lucide-react';

const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washer',
  'Dryer',
  'Dishwasher',
  'Oven',
  'Microwave',
  'HVAC',
  'Water Heater',
  'Garbage Disposal',
  'Air Conditioner',
  'Furnace',
  'Other',
];

const COMMON_BRANDS = [
  'Samsung',
  'LG',
  'Whirlpool',
  'GE',
  'Frigidaire',
  'Maytag',
  'KitchenAid',
  'Bosch',
  'Kenmore',
  'Electrolux',
  'Amana',
  'Hotpoint',
  'Other',
];

const LOCATIONS = [
  'Kitchen',
  'Laundry Room',
  'Garage',
  'Basement',
  'Bathroom',
  'Utility Room',
  'Other',
];

interface ApplianceInventoryProps {
  onSelectAppliance?: (appliance: SavedAppliance) => void;
  selectionMode?: boolean;
}

export function ApplianceInventory({ onSelectAppliance, selectionMode = false }: ApplianceInventoryProps) {
  const [appliances, setAppliances] = useState<SavedAppliance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<SavedAppliance | null>(null);
  const [selectedAppliance, setSelectedAppliance] = useState<SavedAppliance | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    purchaseLocation: '',
    warrantyExpiration: '',
    extendedWarrantyExpiration: '',
    warrantyProvider: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadAppliances();
  }, []);

  const loadAppliances = () => {
    const saved = getSavedAppliances();
    setAppliances(saved);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nickname: '',
      type: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      purchaseLocation: '',
      warrantyExpiration: '',
      extendedWarrantyExpiration: '',
      warrantyProvider: '',
      location: '',
      notes: '',
    });
  };

  const handleEdit = (appliance: SavedAppliance) => {
    setEditingAppliance(appliance);
    setFormData({
      name: appliance.name,
      nickname: appliance.nickname || '',
      type: appliance.type,
      brand: appliance.brand,
      model: appliance.model,
      serialNumber: appliance.serialNumber || '',
      purchaseDate: appliance.purchaseDate ? new Date(appliance.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: appliance.purchasePrice?.toString() || '',
      purchaseLocation: appliance.purchaseLocation || '',
      warrantyExpiration: appliance.warrantyExpiration ? new Date(appliance.warrantyExpiration).toISOString().split('T')[0] : '',
      extendedWarrantyExpiration: appliance.extendedWarrantyExpiration ? new Date(appliance.extendedWarrantyExpiration).toISOString().split('T')[0] : '',
      warrantyProvider: appliance.warrantyProvider || '',
      location: appliance.location || '',
      notes: appliance.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appliance: SavedAppliance = {
      id: editingAppliance?.id || generateId(),
      createdAt: editingAppliance?.createdAt || new Date(),
      updatedAt: new Date(),
      name: formData.name || `${formData.brand} ${formData.type}`,
      nickname: formData.nickname || undefined,
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber || undefined,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      purchaseLocation: formData.purchaseLocation || undefined,
      warrantyExpiration: formData.warrantyExpiration ? new Date(formData.warrantyExpiration) : undefined,
      extendedWarrantyExpiration: formData.extendedWarrantyExpiration ? new Date(formData.extendedWarrantyExpiration) : undefined,
      warrantyProvider: formData.warrantyProvider || undefined,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      repairHistory: editingAppliance?.repairHistory || [],
    };

    saveAppliance(appliance);

    // Create default maintenance schedules for new appliances
    if (!editingAppliance) {
      const schedules = createDefaultMaintenanceSchedules(appliance);
      schedules.forEach(schedule => saveMaintenanceSchedule(schedule));
    }

    loadAppliances();
    setShowAddForm(false);
    setEditingAppliance(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this appliance? This will also delete all repair history and maintenance schedules.')) {
      deleteAppliance(id);
      loadAppliances();
      if (selectedAppliance?.id === id) {
        setSelectedAppliance(null);
      }
    }
  };

  const filteredAppliances = appliances.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWarrantyBadge = (appliance: SavedAppliance) => {
    const status = checkWarrantyStatus(appliance.id);
    if (status.isUnderWarranty) {
      if (status.daysRemaining && status.daysRemaining <= 30) {
        return <Badge variant="warning" size="sm">Warranty expires in {status.daysRemaining} days</Badge>;
      }
      return <Badge variant="success" size="sm">Under Warranty</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">My Appliances</h2>
          <p className="text-surface-500">Track your appliances, warranties, and maintenance</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            resetForm();
            setEditingAppliance(null);
            setShowAddForm(true);
          }}
        >
          Add Appliance
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appliances..."
          className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Appliance Grid */}
      {filteredAppliances.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Box className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No appliances yet</h3>
          <p className="text-surface-500 mb-4">Add your appliances to track warranties and maintenance</p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Appliance
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppliances.map((appliance) => (
            <motion.div
              key={appliance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                padding="md"
                hover
                className="cursor-pointer"
                onClick={() => {
                  if (selectionMode && onSelectAppliance) {
                    onSelectAppliance(appliance);
                  } else {
                    setSelectedAppliance(appliance);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Box className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-900">
                        {appliance.nickname || appliance.name}
                      </h4>
                      <p className="text-sm text-surface-500">{appliance.brand} {appliance.model}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(appliance);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(appliance.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" size="sm">{appliance.type}</Badge>
                  {appliance.location && (
                    <Badge variant="info" size="sm" icon={<Home className="w-3 h-3" />}>
                      {appliance.location}
                    </Badge>
                  )}
                  {getWarrantyBadge(appliance)}
                </div>

                <div className="flex items-center justify-between text-sm text-surface-500">
                  <span>{appliance.repairHistory?.length || 0} repairs</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddForm(false);
              setEditingAppliance(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold text-surface-900">
                    {editingAppliance ? 'Edit Appliance' : 'Add New Appliance'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAppliance(null);
                      resetForm();
                    }}
                    className="p-2 rounded-full hover:bg-surface-100"
                  >
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-surface-700 flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        >
                          <option value="">Select type...</option>
                          {APPLIANCE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Brand *
                        </label>
                        <select
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        >
                          <option value="">Select brand...</option>
                          {COMMON_BRANDS.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Model Number *
                        </label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          placeholder="e.g., WF45R6100AW"
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Serial Number
                        </label>
                        <input
                          type="text"
                          value={formData.serialNumber}
                          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Nickname
                        </label>
                        <input
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                          placeholder='e.g., "Kitchen Fridge"'
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Location
                        </label>
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="">Select location...</option>
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-surface-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Purchase Information
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Price Paid
                        </label>
                        <input
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                          placeholder="$"
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Purchased From
                        </label>
                        <input
                          type="text"
                          value={formData.purchaseLocation}
                          onChange={(e) => setFormData({ ...formData, purchaseLocation: e.target.value })}
                          placeholder="e.g., Home Depot"
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warranty Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-surface-700 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Warranty Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Warranty Expiration
                        </label>
                        <input
                          type="date"
                          value={formData.warrantyExpiration}
                          onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">
                          Extended Warranty Expiration
                        </label>
                        <input
                          type="date"
                          value={formData.extendedWarrantyExpiration}
                          onChange={(e) => setFormData({ ...formData, extendedWarrantyExpiration: e.target.value })}
                          className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Warranty Provider
                      </label>
                      <input
                        type="text"
                        value={formData.warrantyProvider}
                        onChange={(e) => setFormData({ ...formData, warrantyProvider: e.target.value })}
                        placeholder="e.g., Manufacturer, Best Buy, etc."
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAppliance(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      {editingAppliance ? 'Save Changes' : 'Add Appliance'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appliance Detail Modal */}
      <AnimatePresence>
        {selectedAppliance && !selectionMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAppliance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Box className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-surface-900">
                        {selectedAppliance.nickname || selectedAppliance.name}
                      </h3>
                      <p className="text-surface-500">
                        {selectedAppliance.brand} {selectedAppliance.model}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAppliance(null)}
                    className="p-2 rounded-full hover:bg-surface-100"
                  >
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Warranty Status */}
                  {(() => {
                    const status = checkWarrantyStatus(selectedAppliance.id);
                    return (
                      <div className={`p-4 rounded-xl ${status.isUnderWarranty ? 'bg-green-50' : 'bg-surface-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className={`w-5 h-5 ${status.isUnderWarranty ? 'text-green-600' : 'text-surface-400'}`} />
                          <span className="font-semibold text-surface-900">
                            {status.isUnderWarranty ? 'Under Warranty' : 'No Active Warranty'}
                          </span>
                        </div>
                        {status.isUnderWarranty && status.daysRemaining && (
                          <p className="text-sm text-surface-600">
                            {status.warrantyType === 'extended' ? 'Extended warranty' : 'Manufacturer warranty'} expires in {status.daysRemaining} days
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAppliance.serialNumber && (
                      <div>
                        <p className="text-sm text-surface-500">Serial Number</p>
                        <p className="font-mono text-surface-900">{selectedAppliance.serialNumber}</p>
                      </div>
                    )}
                    {selectedAppliance.location && (
                      <div>
                        <p className="text-sm text-surface-500">Location</p>
                        <p className="text-surface-900">{selectedAppliance.location}</p>
                      </div>
                    )}
                    {selectedAppliance.purchaseDate && (
                      <div>
                        <p className="text-sm text-surface-500">Purchase Date</p>
                        <p className="text-surface-900">
                          {new Date(selectedAppliance.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedAppliance.purchasePrice && (
                      <div>
                        <p className="text-sm text-surface-500">Purchase Price</p>
                        <p className="text-surface-900">${selectedAppliance.purchasePrice}</p>
                      </div>
                    )}
                  </div>

                  {/* Repair History */}
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Repair History ({selectedAppliance.repairHistory?.length || 0})
                    </h4>
                    {selectedAppliance.repairHistory && selectedAppliance.repairHistory.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAppliance.repairHistory.slice(0, 5).map((record) => (
                          <div key={record.id} className="p-3 bg-surface-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-surface-900">{record.issue}</span>
                              <Badge
                                variant={record.wasSuccessful ? 'success' : 'danger'}
                                size="sm"
                              >
                                {record.wasSuccessful ? 'Fixed' : 'Unresolved'}
                              </Badge>
                            </div>
                            <p className="text-sm text-surface-500">
                              {new Date(record.date).toLocaleDateString()} • {record.performedBy === 'self' ? 'DIY' : record.professionalName}
                              {record.cost && ` • $${record.cost}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-surface-500 text-sm">No repair history yet</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-surface-200">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      icon={<Edit2 className="w-4 h-4" />}
                      onClick={() => {
                        handleEdit(selectedAppliance);
                        setSelectedAppliance(null);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={<Wrench className="w-4 h-4" />}
                      onClick={() => {
                        // This would navigate to diagnosis with appliance pre-selected
                        window.location.href = `/diagnose?appliance=${selectedAppliance.id}`;
                      }}
                    >
                      Start Diagnosis
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApplianceInventory;
