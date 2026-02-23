'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult, Part } from '@/types';
import {
  X,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  ExternalLink,
  Copy,
  CheckCircle,
  Wrench,
  Package,
  Store,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface SmartPartsListProps {
  result: DiagnosisResult;
  isOpen: boolean;
  onClose: () => void;
}

interface PartItem {
  part: Part;
  checked: boolean;
  quantity: number;
}

const STORES = [
  { name: 'Amazon', baseUrl: 'https://amazon.com/s?k=', icon: '🛒' },
  { name: 'Home Depot', baseUrl: 'https://homedepot.com/s/', icon: '🏠' },
  { name: "Lowe's", baseUrl: 'https://lowes.com/search?searchTerm=', icon: '🔧' },
  { name: 'eBay', baseUrl: 'https://ebay.com/sch/i.html?_nkw=', icon: '📦' },
];

const TOOLS_BY_DIFFICULTY: Record<string, string[]> = {
  easy: ['Screwdriver set (Phillips & flathead)', 'Flashlight'],
  medium: ['Screwdriver set', 'Adjustable wrench', 'Pliers', 'Flashlight', 'Work gloves'],
  hard: ['Screwdriver set', 'Socket wrench set', 'Multimeter', 'Pliers', 'Wire strippers', 'Work gloves', 'Safety glasses'],
  professional: ['Full tool kit recommended', 'Multimeter', 'Specialized tools may be needed'],
};

export function SmartPartsList({ result, isOpen, onClose }: SmartPartsListProps) {
  const [parts, setParts] = useState<PartItem[]>(() =>
    result.partsNeeded.map(p => ({ part: p, checked: false, quantity: 1 }))
  );
  const [copied, setCopied] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (parts.length === 0) return 100;
    return Math.round((parts.filter(p => p.checked).length / parts.length) * 100);
  }, [parts]);

  const togglePart = (index: number) => {
    setParts(prev => prev.map((p, i) =>
      i === index ? { ...p, checked: !p.checked } : p
    ));
  };

  const updateQuantity = (index: number, delta: number) => {
    setParts(prev => prev.map((p, i) =>
      i === index ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const getSearchUrl = (store: typeof STORES[0], part: Part) => {
    const term = encodeURIComponent(part.partNumber ? `${part.name} ${part.partNumber}` : part.name);
    return `${store.baseUrl}${term}`;
  };

  const copyListToClipboard = () => {
    const text = parts.map(p =>
      `${p.checked ? '✓' : '☐'} ${p.part.name}${p.part.partNumber ? ` (${p.part.partNumber})` : ''} x${p.quantity} - ${p.part.estimatedCost}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shopAllAtStore = (store: typeof STORES[0]) => {
    const unchecked = parts.filter(p => !p.checked);
    const toShop = unchecked.length > 0 ? unchecked : parts;
    toShop.forEach((p, i) => {
      setTimeout(() => {
        window.open(getSearchUrl(store, p.part), '_blank');
      }, i * 300);
    });
  };

  const difficulty = result.likelyIssues[0]?.difficulty || 'medium';
  const tools = TOOLS_BY_DIFFICULTY[difficulty] || TOOLS_BY_DIFFICULTY.medium;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Smart Parts List</h3>
                  <p className="text-sm text-surface-500">{parts.length} items needed</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-surface-700">Shopping Progress</span>
                <span className="text-sm font-medium text-emerald-600">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Parts Checklist */}
            <div className="space-y-2 mb-6">
              {parts.map((item, index) => (
                <div
                  key={item.part.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-surface-200'
                  )}
                >
                  <button
                    onClick={() => togglePart(index)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      item.checked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-surface-300 hover:border-emerald-400'
                    )}
                  >
                    {item.checked && <Check className="w-3 h-3" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-sm',
                      item.checked ? 'text-surface-500 line-through' : 'text-surface-900'
                    )}>
                      {item.part.name}
                    </p>
                    {item.part.partNumber && (
                      <p className="text-xs text-surface-400 font-mono">#{item.part.partNumber}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-9 h-9 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="w-9 h-9 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-sm font-medium text-surface-700 flex-shrink-0">{item.part.estimatedCost}</span>

                  {/* Store links dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSelectedStore(selectedStore === item.part.id ? null : item.part.id)}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-surface-100 text-brand-600"
                      title="Find in stores"
                    >
                      <Store className="w-4 h-4" />
                    </button>
                    {selectedStore === item.part.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-surface-200 py-1 z-10 w-36">
                        {STORES.map(store => (
                          <a
                            key={store.name}
                            href={getSearchUrl(store, item.part)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-surface-50 text-sm"
                          >
                            <span>{store.icon}</span>
                            <span>{store.name}</span>
                            <ExternalLink className="w-3 h-3 ml-auto text-surface-400" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Shop All */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-surface-700 mb-2">Quick Shop All</h4>
              <div className="flex gap-2">
                {STORES.map(store => (
                  <button
                    key={store.name}
                    onClick={() => shopAllAtStore(store)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-50 hover:bg-surface-100 rounded-lg text-xs font-medium text-surface-700 transition-colors"
                  >
                    <span>{store.icon}</span>
                    {store.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Needed */}
            <div className="mb-6 p-4 bg-surface-50 rounded-xl">
              <h4 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Tools You'll Need
              </h4>
              <div className="space-y-1.5">
                {tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-surface-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />
                    {tool}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={copyListToClipboard}
              >
                {copied ? 'Copied!' : 'Copy List'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SmartPartsList;
