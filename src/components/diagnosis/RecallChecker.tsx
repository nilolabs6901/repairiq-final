'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import {
  X,
  ShieldAlert,
  ChevronDown,
  Search,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecallCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  prefillType?: string;
  prefillBrand?: string;
}

interface RecallResult {
  recallId: string;
  date: string;
  title: string;
  description: string;
  url: string;
  products: Array<{
    name: string;
    model: string;
    units: string;
    description: string;
  }>;
  hazards: string[];
  manufacturers: string[];
  remedies: string[];
  injuries: string[];
  imageUrl: string | null;
  consumerContact: string;
}

const APPLIANCE_TYPES = [
  'Refrigerator',
  'Washing Machine',
  'Dryer',
  'Dishwasher',
  'Oven',
  'Stove',
  'Microwave',
  'Air Conditioner',
  'Water Heater',
  'Garbage Disposal',
  'Dehumidifier',
  'Space Heater',
  'Pressure Cooker',
];

const COMMON_BRANDS = [
  'Samsung', 'LG', 'Whirlpool', 'GE', 'Maytag', 'Frigidaire', 'Bosch',
  'KitchenAid', 'Kenmore', 'Amana', 'Haier', 'Electrolux', 'Miele',
  'Sub-Zero', 'Viking', 'Thermador', 'Rheem', 'Carrier', 'Trane',
  'Lennox', 'Goodman', 'Instant Pot', 'Ninja', 'Breville', 'Other',
];

export function RecallChecker({ isOpen, onClose, prefillType, prefillBrand }: RecallCheckerProps) {
  const [applianceType, setApplianceType] = useState(prefillType || '');
  const [brand, setBrand] = useState(prefillBrand || '');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [results, setResults] = useState<RecallResult[] | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRecall, setExpandedRecall] = useState<string | null>(null);

  const effectiveBrand = brand === 'Other' ? customBrand : brand;
  const canSearch = applianceType || effectiveBrand;

  const handleSearch = async () => {
    if (!canSearch) return;
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (applianceType) params.set('query', applianceType.toLowerCase());
      if (effectiveBrand) params.set('brand', effectiveBrand);

      const res = await fetch(`/api/recalls?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed');

      setResults(data.results);
      setTotalMatches(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to check recalls. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setApplianceType(prefillType || '');
    setBrand(prefillBrand || '');
    setCustomBrand('');
    setResults(null);
    setError('');
    setExpandedRecall(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setResults(null);
      setError('');
      setExpandedRecall(null);
    }, 300);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">Recall Checker</h2>
                  <p className="text-sm text-surface-500">CPSC safety recall database</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Search Form */}
            <div className="space-y-3 mb-4">
              {/* Appliance Type */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Appliance type
                </label>
                <button
                  onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowBrandDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-surface-300 transition-colors touch-manipulation"
                >
                  <span className={applianceType ? 'text-surface-900' : 'text-surface-400'}>
                    {applianceType || 'Select or leave blank...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-surface-400" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setApplianceType(''); setShowTypeDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm text-surface-400 transition-colors rounded-t-xl"
                    >
                      Any type
                    </button>
                    {APPLIANCE_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => { setApplianceType(type); setShowTypeDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors last:rounded-b-xl"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand */}
              <div className="relative">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Brand
                </label>
                <button
                  onClick={() => { setShowBrandDropdown(!showBrandDropdown); setShowTypeDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-surface-300 transition-colors touch-manipulation"
                >
                  <span className={brand ? 'text-surface-900' : 'text-surface-400'}>
                    {brand || 'Select or leave blank...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-surface-400" />
                </button>
                {showBrandDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setBrand(''); setShowBrandDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm text-surface-400 transition-colors rounded-t-xl"
                    >
                      Any brand
                    </button>
                    {COMMON_BRANDS.map(b => (
                      <button
                        key={b}
                        onClick={() => { setBrand(b); setShowBrandDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors last:rounded-b-xl"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {brand === 'Other' && (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Enter brand name"
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
                icon={<Search className="w-5 h-5" />}
                onClick={handleSearch}
                disabled={!canSearch || isLoading}
              >
                {isLoading ? 'Checking...' : 'Check for Recalls'}
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-surface-500">Searching CPSC recall database...</p>
              </div>
            )}

            {/* Results */}
            {results !== null && !isLoading && (
              <div className="space-y-4">
                {results.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800 mb-1">No Recalls Found</h3>
                    <p className="text-sm text-surface-500 max-w-xs mx-auto">
                      No active CPSC recalls matched your search for
                      {applianceType ? ` ${applianceType}` : ''}
                      {effectiveBrand ? ` by ${effectiveBrand}` : ''}.
                    </p>
                    <p className="text-xs text-surface-400 mt-3">
                      Checked against recalls from the last 5 years.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">
                          {totalMatches} recall{totalMatches !== 1 ? 's' : ''} found
                        </p>
                        <p className="text-xs text-red-600">
                          Review the details below to see if your specific product is affected.
                        </p>
                      </div>
                    </div>

                    {results.map((recall) => {
                      const isExpanded = expandedRecall === recall.recallId;
                      return (
                        <motion.div
                          key={recall.recallId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card
                            padding="md"
                            className={cn(
                              'border cursor-pointer transition-colors',
                              isExpanded ? 'border-red-300 bg-red-50/50' : 'border-surface-200 hover:border-red-200'
                            )}
                            onClick={() => setExpandedRecall(isExpanded ? null : recall.recallId)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-surface-900 text-sm leading-tight">
                                    {recall.title}
                                  </h4>
                                  <Badge variant="danger" size="sm" className="flex-shrink-0">
                                    {formatDate(recall.date)}
                                  </Badge>
                                </div>
                                {recall.manufacturers.length > 0 && (
                                  <p className="text-xs text-surface-500 mb-1">
                                    {recall.manufacturers.join(', ')}
                                  </p>
                                )}
                                {recall.hazards.length > 0 && (
                                  <p className="text-xs text-red-600 line-clamp-2">
                                    {recall.hazards[0]}
                                  </p>
                                )}

                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 space-y-3"
                                  >
                                    {recall.description && (
                                      <div>
                                        <p className="text-xs font-medium text-surface-700 mb-1">Description</p>
                                        <p className="text-xs text-surface-600">{recall.description}</p>
                                      </div>
                                    )}

                                    {recall.products.length > 0 && recall.products[0].units && (
                                      <div>
                                        <p className="text-xs font-medium text-surface-700 mb-1">Units Affected</p>
                                        <p className="text-xs text-surface-600">{recall.products[0].units}</p>
                                      </div>
                                    )}

                                    {recall.remedies.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-surface-700 mb-1">Remedy</p>
                                        <p className="text-xs text-surface-600">{recall.remedies[0]}</p>
                                      </div>
                                    )}

                                    {recall.consumerContact && (
                                      <div>
                                        <p className="text-xs font-medium text-surface-700 mb-1">Contact</p>
                                        <p className="text-xs text-surface-600">{recall.consumerContact}</p>
                                      </div>
                                    )}

                                    {recall.url && (
                                      <a
                                        href={recall.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
                                      >
                                        View full recall on CPSC.gov
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}

                    {totalMatches > results.length && (
                      <p className="text-xs text-center text-surface-400">
                        Showing {results.length} of {totalMatches} matches.{' '}
                        <a
                          href={`https://www.cpsc.gov/Recalls?query=${encodeURIComponent(
                            `${applianceType} ${effectiveBrand}`.trim()
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline"
                        >
                          View all on CPSC.gov
                        </a>
                      </p>
                    )}
                  </>
                )}

                {/* Info */}
                <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-lg text-xs text-surface-500">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Data from the U.S. Consumer Product Safety Commission. Covers recalls from the last 5 years.
                    Always verify with the manufacturer if unsure.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-surface-200">
                  <Button variant="secondary" className="flex-1" onClick={handleReset}>
                    New Search
                  </Button>
                  <Button variant="secondary" className="flex-1" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RecallChecker;
