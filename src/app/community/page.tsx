'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SuccessStories } from '@/components/community/SuccessStories';
import { QAForum } from '@/components/community/QAForum';
import { Card, Button } from '@/components/ui';
import {
  Trophy,
  MessageCircle,
  Users,
  Star,
  TrendingUp,
} from 'lucide-react';

type Tab = 'stories' | 'forum';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stories');

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
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold text-surface-900 mb-4">
              RepairIQ Community
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              Learn from others, share your successes, and get help from experts
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Trophy, label: 'Success Stories', value: '1,247' },
              { icon: MessageCircle, label: 'Questions Answered', value: '3,892' },
              { icon: Star, label: 'Expert Answers', value: '856' },
              { icon: TrendingUp, label: 'Money Saved', value: '$234K' },
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
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'stories'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Success Stories
            </button>
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'forum'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Q&A Forum
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'stories' ? (
            <SuccessStories />
          ) : (
            <QAForum />
          )}
        </div>
      </section>
    </main>
  );
}
