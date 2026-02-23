'use client';

import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Wrench className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-surface-600 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}
