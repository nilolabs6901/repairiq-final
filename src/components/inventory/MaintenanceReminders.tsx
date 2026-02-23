'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { MaintenanceReminder, MaintenanceSchedule } from '@/types';
import {
  getMaintenanceReminders,
  completeMaintenanceTask,
  getMaintenanceSchedules,
  getSavedAppliances,
} from '@/lib/applianceStorage';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  X,
  ChevronRight,
  Filter,
  Plus,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaintenanceRemindersProps {
  compact?: boolean;
  onViewAll?: () => void;
}

export function MaintenanceReminders({ compact = false, onViewAll }: MaintenanceRemindersProps) {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');
  const [selectedReminder, setSelectedReminder] = useState<MaintenanceReminder | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    const loaded = getMaintenanceReminders();
    setReminders(loaded);
  };

  const handleComplete = (reminderId: string) => {
    completeMaintenanceTask(reminderId);
    loadReminders();
    setSelectedReminder(null);
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'overdue') return r.isOverdue;
    if (filter === 'upcoming') return !r.isOverdue;
    return true;
  });

  const overdueCount = reminders.filter(r => r.isOverdue).length;
  const upcomingCount = reminders.filter(r => !r.isOverdue).length;

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    if (diffDays <= 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;
    return `Due ${dueDate.toLocaleDateString()}`;
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  if (compact) {
    // Compact view for dashboard widget
    const displayReminders = reminders.slice(0, 3);

    return (
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-surface-900">Maintenance</h3>
            {overdueCount > 0 && (
              <Badge variant="danger" size="sm">{overdueCount} overdue</Badge>
            )}
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {displayReminders.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-4">
            No upcoming maintenance tasks
          </p>
        ) : (
          <div className="space-y-2">
            {displayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 cursor-pointer"
                onClick={() => setSelectedReminder(reminder)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', reminder.isOverdue ? 'bg-red-500' : 'bg-amber-500')} />
                  <div>
                    <p className="text-sm font-medium text-surface-900">{reminder.taskName}</p>
                    <p className="text-xs text-surface-500">{reminder.applianceName}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  reminder.isOverdue ? 'text-red-600' : 'text-surface-500'
                )}>
                  {formatDueDate(reminder.dueDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900">Maintenance Reminders</h2>
          <p className="text-surface-500">Keep your appliances running smoothly</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="md" className="text-center">
          <div className="text-3xl font-bold text-surface-900">{reminders.length}</div>
          <div className="text-sm text-surface-500">Total Tasks</div>
        </Card>
        <Card padding="md" className={cn('text-center', overdueCount > 0 && 'bg-red-50')}>
          <div className={cn('text-3xl font-bold', overdueCount > 0 ? 'text-red-600' : 'text-surface-900')}>
            {overdueCount}
          </div>
          <div className="text-sm text-surface-500">Overdue</div>
        </Card>
        <Card padding="md" className="text-center">
          <div className="text-3xl font-bold text-amber-600">{upcomingCount}</div>
          <div className="text-sm text-surface-500">Upcoming</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'overdue', 'upcoming'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'overdue' && overdueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {filter === 'overdue' ? 'No Overdue Tasks' : filter === 'upcoming' ? 'No Upcoming Tasks' : 'No Maintenance Tasks'}
          </h3>
          <p className="text-surface-500 mb-4">
            {reminders.length === 0
              ? 'Add appliances to your inventory to get maintenance reminders'
              : 'Great job staying on top of maintenance!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                padding="md"
                hover
                className={cn(
                  'cursor-pointer',
                  reminder.isOverdue && 'border-red-200 bg-red-50/50'
                )}
                onClick={() => setSelectedReminder(reminder)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      getPriorityColor(reminder.priority)
                    )}>
                      {reminder.isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-900">{reminder.taskName}</h4>
                      <p className="text-sm text-surface-500">{reminder.applianceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn(
                        'font-medium',
                        reminder.isOverdue ? 'text-red-600' : 'text-surface-700'
                      )}>
                        {formatDueDate(reminder.dueDate)}
                      </p>
                      <p className="text-xs text-surface-500">
                        {new Date(reminder.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant={reminder.isOverdue ? 'primary' : 'secondary'}
                      size="sm"
                      icon={<CheckCircle className="w-4 h-4" />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleComplete(reminder.id);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reminder Detail Modal */}
      <AnimatePresence>
        {selectedReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReminder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      getPriorityColor(selectedReminder.priority)
                    )}>
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-surface-900">
                        {selectedReminder.taskName}
                      </h3>
                      <p className="text-sm text-surface-500">{selectedReminder.applianceName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReminder(null)}
                    className="p-2 rounded-full hover:bg-surface-100"
                  >
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>

                <div className={cn(
                  'p-4 rounded-xl mb-4',
                  selectedReminder.isOverdue ? 'bg-red-50' : 'bg-surface-50'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={cn(
                      'w-5 h-5',
                      selectedReminder.isOverdue ? 'text-red-600' : 'text-surface-500'
                    )} />
                    <span className={cn(
                      'font-medium',
                      selectedReminder.isOverdue ? 'text-red-600' : 'text-surface-700'
                    )}>
                      {formatDueDate(selectedReminder.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600">
                    Scheduled for {new Date(selectedReminder.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-surface-900 mb-2">Description</h4>
                  <p className="text-surface-600">{selectedReminder.description}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelectedReminder(null)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleComplete(selectedReminder.id)}
                  >
                    Mark Complete
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MaintenanceReminders;
