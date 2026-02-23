'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ApplianceInventory } from '@/components/inventory/ApplianceInventory';
import { MaintenanceReminders } from '@/components/inventory/MaintenanceReminders';
import { Card } from '@/components/ui';
import {
  Box,
  Bell,
  BarChart3,
  Shield,
} from 'lucide-react';
import { getRepairStats } from '@/lib/applianceStorage';

type Tab = 'appliances' | 'maintenance' | 'stats';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('appliances');
  const stats = getRepairStats();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-white">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-6">
              <Box className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-surface-900 mb-4">
              My Appliances
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              Track your appliances, warranties, and maintenance schedules
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Box, label: 'Total Repairs', value: stats.totalRepairs.toString() },
              { icon: BarChart3, label: 'Total Spent', value: `$${stats.totalSpent}` },
              { icon: Shield, label: 'Success Rate', value: `${stats.successRate}%` },
              { icon: Bell, label: 'Avg Cost', value: `$${stats.avgCostPerRepair}` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card padding="md" className="text-center">
                  <stat.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                  <p className="text-sm text-surface-500">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-surface-200 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('appliances')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'appliances'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              }`}
            >
              <Box className="w-5 h-5" />
              My Appliances
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'maintenance'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              }`}
            >
              <Bell className="w-5 h-5" />
              Maintenance
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'appliances' ? (
            <ApplianceInventory />
          ) : (
            <MaintenanceReminders />
          )}
        </div>
      </section>
    </main>
  );
}
