'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import { getOutcomeStats, getAppRatings, getAverageAppRating } from '@/lib/storage';
import {
  BarChart3,
  Users,
  ThumbsUp,
  ThumbsDown,
  Star,
  Mail,
  TrendingUp,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Database,
  Activity,
} from 'lucide-react';

interface ServerMetrics {
  metrics: {
    apiCalls: Record<string, number>;
    subscriberCount: number;
    leadCount: number;
    recentSearches: Array<{ query: string; timestamp: string }>;
  };
  serverInfo: {
    uptime: number;
    timestamp: string;
    note: string;
  };
}

interface ClientMetrics {
  feedbackStats: {
    total: number;
    thumbsUp: number;
    thumbsDown: number;
    comments: string[];
  };
  outcomeStats: {
    totalReported: number;
    successRate: number;
    averageDifficulty: number;
    wouldRecommendRate: number;
  };
  ratingStats: {
    totalRatings: number;
    averageRating: number;
  };
  subscriberEmail: string | null;
}

const FEEDBACK_KEY = 'repairiq_quick_feedback';
const SIGNUP_KEY = 'repairiq_tip_subscriber';

function getClientMetrics(): ClientMetrics {
  // Quick feedback
  let feedbackStats = { total: 0, thumbsUp: 0, thumbsDown: 0, comments: [] as string[] };
  try {
    const data = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
    const entries = Object.values(data) as Array<{ vote: string; comment?: string }>;
    feedbackStats.total = entries.length;
    feedbackStats.thumbsUp = entries.filter(e => e.vote === 'up').length;
    feedbackStats.thumbsDown = entries.filter(e => e.vote === 'down').length;
    feedbackStats.comments = entries
      .filter(e => e.comment)
      .map(e => e.comment as string);
  } catch {}

  // Outcome stats
  const outcomeStats = getOutcomeStats();

  // App ratings
  const ratings = getAppRatings();
  const averageRating = getAverageAppRating();

  // Subscriber
  let subscriberEmail: string | null = null;
  try {
    const sub = JSON.parse(localStorage.getItem(SIGNUP_KEY) || 'null');
    subscriberEmail = sub?.email || null;
  } catch {}

  return {
    feedbackStats,
    outcomeStats,
    ratingStats: {
      totalRatings: ratings.length,
      averageRating,
    },
    subscriberEmail,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-brand-600',
  bgColor = 'bg-brand-100',
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  bgColor?: string;
  subtitle?: string;
}) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
          <p className="text-sm text-surface-500">{label}</p>
          {subtitle && <p className="text-xs text-surface-400">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const [client, setClient] = useState<ClientMetrics | null>(null);
  const [server, setServer] = useState<ServerMetrics | null>(null);
  const [serverError, setServerError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);

    // Client-side data
    setClient(getClientMetrics());

    // Server-side data
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setServer(await res.json());
        setServerError(false);
      } else {
        setServerError(true);
      }
    } catch {
      setServerError(true);
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-surface-500" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900">
                Admin Dashboard
              </h1>
              <Badge variant="warning" size="sm">Internal</Badge>
            </div>
            <p className="text-surface-500 ml-12">
              User engagement, feedback, and feature usage at a glance.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={loadData}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </div>

        {/* Feedback Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-brand-500" />
            Diagnosis Feedback
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Feedback"
              value={client?.feedbackStats.total || 0}
              icon={BarChart3}
            />
            <StatCard
              label="Thumbs Up"
              value={client?.feedbackStats.thumbsUp || 0}
              icon={ThumbsUp}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              label="Thumbs Down"
              value={client?.feedbackStats.thumbsDown || 0}
              icon={ThumbsDown}
              color="text-red-600"
              bgColor="bg-red-100"
            />
            <StatCard
              label="Helpful Rate"
              value={
                client && client.feedbackStats.total > 0
                  ? `${Math.round((client.feedbackStats.thumbsUp / client.feedbackStats.total) * 100)}%`
                  : '—'
              }
              icon={TrendingUp}
              color="text-amber-600"
              bgColor="bg-amber-100"
            />
          </div>

          {/* Negative feedback comments */}
          {client && client.feedbackStats.comments.length > 0 && (
            <Card padding="md" className="mt-4">
              <h3 className="text-sm font-semibold text-surface-700 mb-3">User Comments</h3>
              <div className="space-y-2">
                {client.feedbackStats.comments.map((comment, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ThumbsDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-600">{comment}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        {/* Outcome & Ratings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Repair Outcomes & App Ratings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Outcomes Reported"
              value={client?.outcomeStats.totalReported || 0}
              icon={Activity}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              label="Success Rate"
              value={client?.outcomeStats.totalReported ? `${client.outcomeStats.successRate}%` : '—'}
              icon={TrendingUp}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              label="Avg App Rating"
              value={client?.ratingStats.averageRating ? `${client.ratingStats.averageRating}/5` : '—'}
              icon={Star}
              color="text-amber-600"
              bgColor="bg-amber-100"
              subtitle={client?.ratingStats.totalRatings ? `${client.ratingStats.totalRatings} ratings` : undefined}
            />
            <StatCard
              label="Would Recommend"
              value={client?.outcomeStats.totalReported ? `${client.outcomeStats.wouldRecommendRate}%` : '—'}
              icon={Users}
              color="text-violet-600"
              bgColor="bg-violet-100"
            />
          </div>
        </section>

        {/* Server Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-500" />
            Server Metrics
            {serverError && (
              <Badge variant="danger" size="sm">Unavailable</Badge>
            )}
          </h2>

          {serverError ? (
            <Card padding="md" className="bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>Could not fetch server metrics. The app may not be running in server mode.</span>
              </div>
            </Card>
          ) : server ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                  label="Email Subscribers"
                  value={server.metrics.subscriberCount}
                  icon={Mail}
                  color="text-violet-600"
                  bgColor="bg-violet-100"
                />
                <StatCard
                  label="Leads Captured"
                  value={server.metrics.leadCount}
                  icon={Users}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
                <StatCard
                  label="Server Uptime"
                  value={formatUptime(server.serverInfo.uptime)}
                  icon={Clock}
                  color="text-cyan-600"
                  bgColor="bg-cyan-100"
                />
                <StatCard
                  label="Total API Calls"
                  value={Object.values(server.metrics.apiCalls).reduce((a, b) => a + b, 0)}
                  icon={BarChart3}
                  color="text-surface-600"
                  bgColor="bg-surface-100"
                />
              </div>

              {/* API breakdown */}
              <Card padding="md" className="mb-4">
                <h3 className="text-sm font-semibold text-surface-700 mb-3">API Calls by Endpoint</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(server.metrics.apiCalls).map(([endpoint, count]) => (
                    <div key={endpoint} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                      <span className="text-sm text-surface-600">/api/{endpoint}</span>
                      <span className="text-sm font-semibold text-surface-900">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent searches */}
              {server.metrics.recentSearches.length > 0 && (
                <Card padding="md">
                  <h3 className="text-sm font-semibold text-surface-700 mb-3">Recent Recall Searches</h3>
                  <div className="space-y-1">
                    {server.metrics.recentSearches.map((search, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1">
                        <span className="text-surface-700">{search.query}</span>
                        <span className="text-xs text-surface-400">
                          {new Date(search.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-surface-200 border-t-surface-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </section>

        {/* Persistence Warning */}
        <Card padding="md" className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">Data Persistence Note</h3>
              <p className="text-sm text-amber-700 mt-1">
                Client-side metrics (feedback, ratings, outcomes) are stored in this browser&apos;s localStorage.
                Server-side metrics (subscribers, leads, API calls) are in-memory and reset on server restart.
                To make all data permanent, connect a database like Vercel Postgres or Supabase.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
