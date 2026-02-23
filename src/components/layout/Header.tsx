'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Wrench,
  History,
  Users,
  Menu,
  X,
  Sparkles,
  Hammer,
} from 'lucide-react';

const navItems = [
  { href: '/diagnose', label: 'Start Diagnosis', icon: Sparkles },
  { href: '/toolkit', label: 'Toolkit', icon: Hammer },
  { href: '/history', label: 'My Repairs', icon: History },
  { href: '/professionals', label: 'Find Pros', icon: Users },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-surface-100" />
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wrench className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-xl text-surface-900 group-hover:text-brand-600 transition-colors">
              Repair<span className="text-brand-500">IQ</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/diagnose">
              <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
                New Diagnosis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-100 transition-colors touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-surface-700" />
            ) : (
              <Menu className="w-6 h-6 text-surface-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-surface-100"
          >
            <div className="px-4 py-4 space-y-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-surface-600 hover:bg-surface-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link href="/diagnose" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="lg" className="w-full" icon={<Sparkles className="w-4 h-4" />}>
                    New Diagnosis
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
