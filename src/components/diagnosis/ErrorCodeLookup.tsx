'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { ErrorCode } from '@/types';
import {
  searchErrorCodes,
  getAvailableBrands,
  getAvailableApplianceTypes,
  getRelatedCodes,
} from '@/lib/errorCodes';
import {
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Wrench,
  DollarSign,
  Clock,
  Info,
  HelpCircle,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { cn, getDifficultyLabel, getDifficultyColor } from '@/lib/utils';

interface ErrorCodeLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode?: (code: ErrorCode) => void;
  initialCode?: string;
}

export function ErrorCodeLookup({ isOpen, onClose, onSelectCode, initialCode }: ErrorCodeLookupProps) {
  const [searchQuery, setSearchQuery] = useState(initialCode || '');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [results, setResults] = useState<ErrorCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<ErrorCode | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const brands = getAvailableBrands();
  const applianceTypes = getAvailableApplianceTypes();

  useEffect(() => {
    if (searchQuery.length >= 1) {
      const searchResults = searchErrorCodes(searchQuery, selectedBrand, selectedType);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedBrand, selectedType]);

  useEffect(() => {
    if (initialCode) {
      setSearchQuery(initialCode);
    }
  }, [initialCode]);

  const handleCodeSelect = (code: ErrorCode) => {
    setSelectedCode(code);
  };

  const handleUseCode = () => {
    if (selectedCode && onSelectCode) {
      onSelectCode(selectedCode);
      onClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedType('');
    setResults([]);
    setSelectedCode(null);
    onClose();
  };

  const relatedCodes = selectedCode ? getRelatedCodes(selectedCode) : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <Card padding="none" className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-surface-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-surface-900">Error Code Lookup</h2>
                    <p className="text-sm text-surface-500">Find what your appliance error means</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="Enter error code (e.g., E24, F5 E2, OE)"
                  className="w-full pl-10 pr-10 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-lg font-mono"
                  autoFocus
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors',
                    showFilters ? 'bg-brand-100 text-brand-600' : 'text-surface-400 hover:text-surface-600'
                  )}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 flex gap-3"
                >
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm"
                  >
                    <option value="">All Appliances</option>
                    {applianceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedCode ? (
                /* Code details view */
                <div className="p-4 space-y-4">
                  <button
                    onClick={() => setSelectedCode(null)}
                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to results
                  </button>

                  <div className="bg-gradient-to-br from-surface-50 to-surface-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-mono font-bold text-surface-900">
                            {selectedCode.code}
                          </span>
                          <Badge variant="outline">{selectedCode.brand}</Badge>
                          <Badge variant="info">{selectedCode.applianceType}</Badge>
                        </div>
                        <p className="text-surface-600">{selectedCode.description}</p>
                      </div>
                      <Badge
                        variant={
                          selectedCode.difficulty === 'easy' ? 'success' :
                          selectedCode.difficulty === 'medium' ? 'warning' :
                          selectedCode.difficulty === 'hard' ? 'danger' : 'info'
                        }
                      >
                        {getDifficultyLabel(selectedCode.difficulty)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-surface-500">
                      {selectedCode.estimatedCost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{selectedCode.estimatedCost}</span>
                        </div>
                      )}
                      {selectedCode.professionalRequired && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Professional recommended</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Possible causes */}
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      Possible Causes
                    </h4>
                    <ul className="space-y-2">
                      {selectedCode.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-2 text-surface-600">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested fixes */}
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-green-500" />
                      Suggested Fixes
                    </h4>
                    <ul className="space-y-2">
                      {selectedCode.suggestedFixes.map((fix, i) => (
                        <li key={i} className="flex items-start gap-2 text-surface-600">
                          <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Related codes */}
                  {relatedCodes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-surface-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Related Error Codes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {relatedCodes.map((code) => (
                          <button
                            key={code.id}
                            onClick={() => setSelectedCode(code)}
                            className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 rounded-lg text-sm font-mono transition-colors"
                          >
                            {code.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {onSelectCode && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mt-4"
                      onClick={handleUseCode}
                    >
                      Use This Information in Diagnosis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              ) : (
                /* Search results */
                <div className="p-4">
                  {searchQuery.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-surface-900 mb-2">
                        Search for an Error Code
                      </h3>
                      <p className="text-surface-500 mb-4">
                        Enter the error code displayed on your appliance
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-xs text-surface-400">Examples:</span>
                        {['E24', 'F5 E2', 'OE', 'HE', 'UE'].map((code) => (
                          <button
                            key={code}
                            onClick={() => setSearchQuery(code)}
                            className="px-2 py-1 bg-surface-100 hover:bg-surface-200 rounded text-sm font-mono transition-colors"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-surface-900 mb-2">
                        No Results Found
                      </h3>
                      <p className="text-surface-500 mb-4">
                        We couldn't find "{searchQuery}" in our database
                      </p>
                      <p className="text-sm text-surface-400">
                        Try a different code or check the spelling
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-surface-500 mb-3">
                        Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </p>
                      {results.map((code) => (
                        <button
                          key={code.id}
                          onClick={() => handleCodeSelect(code)}
                          className="w-full p-4 bg-surface-50 hover:bg-surface-100 rounded-xl text-left transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-mono font-bold text-surface-900">
                                  {code.code}
                                </span>
                                <Badge variant="outline" size="sm">{code.brand}</Badge>
                                <Badge variant="info" size="sm">{code.applianceType}</Badge>
                              </div>
                              <p className="text-sm text-surface-600 line-clamp-2">
                                {code.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-brand-500 transition-colors flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ErrorCodeLookup;
