'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { Home, Wrench, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <main className="pt-32 pb-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 bg-brand-100 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="w-16 h-16 text-brand-500" />
              </div>
            </div>

            <h1 className="text-6xl font-display font-bold text-surface-900 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-surface-700 mb-4">
              Page Not Found
            </h2>
            <p className="text-surface-600 mb-8">
              Looks like this page needs some repairs! Let&apos;s get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Home className="w-5 h-5" />}
                >
                  Go Home
                </Button>
              </Link>
              <Link href="/diagnose">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Wrench className="w-5 h-5" />}
                >
                  Start Diagnosis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
