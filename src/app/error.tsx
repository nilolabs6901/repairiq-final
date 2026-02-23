'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>

        <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-surface-600 mb-6">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={<RotateCcw className="w-5 h-5" />}
            onClick={reset}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="secondary"
              size="lg"
              icon={<Home className="w-5 h-5" />}
            >
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
