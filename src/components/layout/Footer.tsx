'use client';

import Link from 'next/link';
import { Wrench, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Repair<span className="text-brand-400">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed">
              AI-powered repair diagnostics that help you fix things faster and smarter.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/diagnose" className="block py-1.5 hover:text-white transition-colors">
                  Start Diagnosis
                </Link>
              </li>
              <li>
                <Link href="/history" className="block py-1.5 hover:text-white transition-colors">
                  Repair History
                </Link>
              </li>
              <li>
                <Link href="/professionals" className="block py-1.5 hover:text-white transition-colors">
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link href="/toolkit" className="block py-1.5 hover:text-white transition-colors">
                  Repair Toolkit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} RepairIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-800 rounded-lg transition-colors touch-manipulation">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-800 rounded-lg transition-colors touch-manipulation">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-800 rounded-lg transition-colors touch-manipulation">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
