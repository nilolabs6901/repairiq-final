'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, Footer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { getSessions, deleteSession, getSavedRepairs, deleteSavedRepair } from '@/lib/storage';
import { formatRelativeTime, getDifficultyLabel } from '@/lib/utils';
import { RepairSession, DiagnosisResult } from '@/types';
import {
  History,
  Bookmark,
  Trash2,
  ChevronRight,
  MessageSquare,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
} from 'lucide-react';

type TabType = 'sessions' | 'saved';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [sessions, setSessions] = useState<RepairSession[]>([]);
  const [savedRepairs, setSavedRepairs] = useState<DiagnosisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSessions(getSessions());
    setSavedRepairs(getSavedRepairs());
  }, []);

  const handleDeleteSession = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(id);
      setSessions(getSessions());
    }
  };

  const handleDeleteSavedRepair = (id: string) => {
    if (confirm('Are you sure you want to remove this saved repair?')) {
      deleteSavedRepair(id);
      setSavedRepairs(getSavedRepairs());
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSavedRepairs = savedRepairs.filter(
    (r) =>
      r.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
              My Repairs
            </h1>
            <p className="text-surface-600">
              View your past diagnoses and saved repair guides.
            </p>
          </div>

          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex bg-surface-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'sessions'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <History className="w-4 h-4" />
                Sessions
                <Badge variant="outline" size="sm">
                  {sessions.length}
                </Badge>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
                <Badge variant="outline" size="sm">
                  {savedRepairs.length}
                </Badge>
              </button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search repairs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'sessions' ? (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {filteredSessions.length === 0 ? (
                  <Card padding="lg" className="text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-surface-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                      No sessions yet
                    </h3>
                    <p className="text-surface-600 mb-4">
                      Start a new diagnosis to see your history here.
                    </p>
                    <Link href="/diagnose">
                      <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                        New Diagnosis
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {filteredSessions.map((session) => (
                      <motion.div key={session.id} variants={item}>
                        <Card
                          hover
                          padding="md"
                          className="group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                session.stage === 'complete'
                                  ? 'bg-brand-100 text-brand-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {session.stage === 'complete' ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <Clock className="w-6 h-6" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-semibold text-surface-900 truncate">
                                    {session.itemName || 'Untitled Session'}
                                  </h3>
                                  <p className="text-sm text-surface-500 truncate">
                                    {session.messages.length} messages •{' '}
                                    {formatRelativeTime(session.updatedAt)}
                                  </p>
                                </div>
                                <Badge
                                  variant={session.stage === 'complete' ? 'success' : 'warning'}
                                  size="sm"
                                >
                                  {session.stage === 'complete' ? 'Complete' : 'In Progress'}
                                </Badge>
                              </div>

                              {session.result && (
                                <div className="flex items-center gap-4 mt-2 text-sm text-surface-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {session.result.estimatedTotalTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {session.result.estimatedTotalCost}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSession(session.id);
                                }}
                                className="text-surface-400 hover:text-rose-500"
                              />
                              <Link href={`/diagnose?session=${session.id}`}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={<ChevronRight className="w-4 h-4" />}
                                  iconPosition="right"
                                >
                                  Open
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {filteredSavedRepairs.length === 0 ? (
                  <Card padding="lg" className="text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="w-8 h-8 text-surface-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                      No saved repairs
                    </h3>
                    <p className="text-surface-600 mb-4">
                      Save diagnoses to quickly access them later.
                    </p>
                    <Link href="/diagnose">
                      <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                        New Diagnosis
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {filteredSavedRepairs.map((repair) => (
                      <motion.div key={repair.id} variants={item}>
                        <Card hover padding="md" className="group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                              <Bookmark className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-surface-900">
                                {repair.itemDescription}
                              </h3>
                              <p className="text-sm text-surface-500 truncate mb-2">
                                {repair.summary}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-surface-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {repair.estimatedTotalTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {repair.estimatedTotalCost}
                                </span>
                                {repair.shouldCallProfessional && (
                                  <Badge variant="warning" size="sm">
                                    Pro Recommended
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSavedRepair(repair.id);
                                }}
                                className="text-surface-400 hover:text-rose-500"
                              />
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<ChevronRight className="w-4 h-4" />}
                                iconPosition="right"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
