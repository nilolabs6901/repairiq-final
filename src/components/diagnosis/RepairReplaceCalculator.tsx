'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import {
  X,
  Calculator,
  Wrench,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Info,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepairReplaceCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Verdict = 'repair' | 'replace' | 'borderline';

interface CalculatorResult {
  verdict: Verdict;
  score: number; // 0-100, higher = more reason to replace
  reasons: string[];
  lifespanRemaining: string;
  repairCostPercent: number;
  replacementCostRange: { min: number; max: number };
}

const APPLIANCE_OPTIONS = [
  { label: 'Refrigerator', value: 'refrigerator', lifespan: 13, replaceCost: { min: 800, max: 2500 } },
  { label: 'Washing Machine', value: 'washer', lifespan: 11, replaceCost: { min: 500, max: 1500 } },
  { label: 'Dryer', value: 'dryer', lifespan: 12, replaceCost: { min: 400, max: 1200 } },
  { label: 'Dishwasher', value: 'dishwasher', lifespan: 10, replaceCost: { min: 400, max: 1200 } },
  { label: 'Oven / Stove', value: 'oven', lifespan: 14, replaceCost: { min: 500, max: 2000 } },
  { label: 'Microwave', value: 'microwave', lifespan: 9, replaceCost: { min: 100, max: 500 } },
  { label: 'HVAC / AC', value: 'hvac', lifespan: 17, replaceCost: { min: 3000, max: 8000 } },
  { label: 'Water Heater', value: 'water-heater', lifespan: 10, replaceCost: { min: 600, max: 1500 } },
  { label: 'Garbage Disposal', value: 'disposal', lifespan: 10, replaceCost: { min: 80, max: 250 } },
  { label: 'Garage Door Opener', value: 'garage-door', lifespan: 12, replaceCost: { min: 200, max: 600 } },
];

function calculateVerdict(
  applianceValue: string,
  ageYears: number,
  repairCost: number
): CalculatorResult {
  const appliance = APPLIANCE_OPTIONS.find(a => a.value === applianceValue)!;
  const { lifespan, replaceCost } = appliance;

  const avgReplaceCost = (replaceCost.min + replaceCost.max) / 2;
  const repairCostPercent = Math.round((repairCost / avgReplaceCost) * 100);
  const agePercent = (ageYears / lifespan) * 100;
  const yearsRemaining = Math.max(0, lifespan - ageYears);

  // Score: higher = more reason to replace (0-100)
  let score = 0;
  const reasons: string[] = [];

  // Factor 1: The 50% rule - if repair > 50% of replacement, lean replace
  if (repairCostPercent >= 50) {
    score += 40;
    reasons.push(`Repair cost is ${repairCostPercent}% of replacement cost — exceeds the 50% rule of thumb.`);
  } else if (repairCostPercent >= 30) {
    score += 20;
    reasons.push(`Repair cost is ${repairCostPercent}% of replacement cost — getting close to the 50% threshold.`);
  } else {
    reasons.push(`Repair cost is only ${repairCostPercent}% of replacement cost — well within the repair-worthy range.`);
  }

  // Factor 2: Age relative to lifespan
  if (agePercent >= 85) {
    score += 35;
    reasons.push(`At ${ageYears} years old, this appliance has exceeded ${Math.round(agePercent)}% of its typical ${lifespan}-year lifespan.`);
  } else if (agePercent >= 65) {
    score += 20;
    reasons.push(`At ${ageYears} years old, it's past the midpoint of its ${lifespan}-year expected life.`);
  } else if (agePercent >= 40) {
    score += 10;
    reasons.push(`At ${ageYears} years old, it still has good life left (typical lifespan: ${lifespan} years).`);
  } else {
    reasons.push(`At only ${ageYears} year${ageYears === 1 ? '' : 's'} old, this appliance is relatively new (typical lifespan: ${lifespan} years).`);
  }

  // Factor 3: Cost per remaining year if repaired
  if (yearsRemaining > 0) {
    const costPerYear = repairCost / yearsRemaining;
    const replacePerYear = avgReplaceCost / lifespan;
    if (costPerYear > replacePerYear) {
      score += 15;
      reasons.push(`Repair cost per remaining year ($${Math.round(costPerYear)}/yr) exceeds what a new unit would cost per year ($${Math.round(replacePerYear)}/yr).`);
    } else {
      reasons.push(`Repairing costs about $${Math.round(costPerYear)}/yr for remaining life vs $${Math.round(replacePerYear)}/yr for a new unit — repair is the better deal.`);
    }
  } else {
    score += 10;
    reasons.push('This appliance has already exceeded its expected lifespan.');
  }

  // Factor 4: Energy efficiency (older appliances waste more energy)
  if (ageYears >= 10) {
    score += 5;
    reasons.push('A newer model would likely be more energy-efficient, saving on utility bills.');
  }

  // Clamp
  score = Math.min(100, Math.max(0, score));

  let verdict: Verdict;
  if (score >= 55) {
    verdict = 'replace';
  } else if (score >= 35) {
    verdict = 'borderline';
  } else {
    verdict = 'repair';
  }

  const lifespanRemaining = yearsRemaining <= 0
    ? 'Past expected lifespan'
    : `~${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'} remaining`;

  return {
    verdict,
    score,
    reasons,
    lifespanRemaining,
    repairCostPercent,
    replacementCostRange: replaceCost,
  };
}

export function RepairReplaceCalculator({ isOpen, onClose }: RepairReplaceCalculatorProps) {
  const [applianceType, setApplianceType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [ageYears, setAgeYears] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const canCalculate = applianceType && ageYears && repairCost && Number(repairCost) > 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    setResult(calculateVerdict(applianceType, Number(ageYears), Number(repairCost)));
  };

  const handleReset = () => {
    setApplianceType('');
    setAgeYears('');
    setRepairCost('');
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setResult(null);
      setApplianceType('');
      setAgeYears('');
      setRepairCost('');
    }, 300);
  };

  if (!isOpen) return null;

  const selectedAppliance = APPLIANCE_OPTIONS.find(a => a.value === applianceType);

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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">Repair vs. Replace</h2>
                  <p className="text-sm text-surface-500">Find out which makes more sense</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Input Form */}
            {!result ? (
              <div className="space-y-4">
                {/* Appliance Type */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Appliance type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-500 hover:border-surface-300 transition-colors touch-manipulation"
                    >
                      <span className={applianceType ? 'text-surface-900' : 'text-surface-400'}>
                        {selectedAppliance?.label || 'Select an appliance...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-surface-400" />
                    </button>
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        {APPLIANCE_OPTIONS.map(option => (
                          <button
                            key={option.value}
                            onClick={() => { setApplianceType(option.value); setShowDropdown(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {option.label}
                            <span className="text-surface-400 ml-2">({option.lifespan} yr avg life)</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    How old is it? (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={ageYears}
                    onChange={(e) => setAgeYears(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-3 border border-surface-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Repair Cost */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Estimated repair cost ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                    <input
                      type="number"
                      min="0"
                      value={repairCost}
                      onChange={(e) => setRepairCost(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full pl-8 pr-4 py-3 border border-surface-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Calculate Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  icon={<Calculator className="w-5 h-5" />}
                  onClick={handleCalculate}
                  disabled={!canCalculate}
                >
                  Calculate
                </Button>
              </div>
            ) : (
              /* Results */
              <div className="space-y-5">
                {/* Verdict Banner */}
                <div className={cn(
                  'p-5 rounded-xl text-center',
                  result.verdict === 'repair' ? 'bg-green-50 border border-green-200' :
                  result.verdict === 'replace' ? 'bg-purple-50 border border-purple-200' :
                  'bg-amber-50 border border-amber-200'
                )}>
                  <div className="flex justify-center mb-3">
                    {result.verdict === 'repair' ? (
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <Wrench className="w-7 h-7 text-green-600" />
                      </div>
                    ) : result.verdict === 'replace' ? (
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                        <ShoppingCart className="w-7 h-7 text-purple-600" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <h3 className={cn(
                    'text-xl font-bold mb-1',
                    result.verdict === 'repair' ? 'text-green-800' :
                    result.verdict === 'replace' ? 'text-purple-800' :
                    'text-amber-800'
                  )}>
                    {result.verdict === 'repair' ? 'Repair It' :
                     result.verdict === 'replace' ? 'Replace It' :
                     'It\'s a Toss-Up'}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    result.verdict === 'repair' ? 'text-green-600' :
                    result.verdict === 'replace' ? 'text-purple-600' :
                    'text-amber-600'
                  )}>
                    {result.verdict === 'repair'
                      ? 'Repairing is the smarter financial choice right now.'
                      : result.verdict === 'replace'
                      ? 'Replacing makes more financial sense at this point.'
                      : 'It could go either way — consider your personal preference.'}
                  </p>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <p className="text-xs text-surface-500 mb-1">Repair Cost vs. New</p>
                    <p className="text-lg font-bold text-surface-900">{result.repairCostPercent}%</p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <p className="text-xs text-surface-500 mb-1">Expected Life Left</p>
                    <p className="text-lg font-bold text-surface-900">{result.lifespanRemaining}</p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <p className="text-xs text-surface-500 mb-1">Your Repair Cost</p>
                    <p className="text-lg font-bold text-surface-900">${repairCost}</p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <p className="text-xs text-surface-500 mb-1">Replacement Cost</p>
                    <p className="text-lg font-bold text-surface-900">
                      ${result.replacementCostRange.min}-${result.replacementCostRange.max}
                    </p>
                  </div>
                </div>

                {/* Replace Score Bar */}
                <div>
                  <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                    <span className="flex items-center gap-1"><Wrench className="w-3 h-3" /> Repair</span>
                    <span className="flex items-center gap-1">Replace <ShoppingCart className="w-3 h-3" /></span>
                  </div>
                  <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        result.score < 35 ? 'bg-green-500' :
                        result.score < 55 ? 'bg-amber-500' :
                        'bg-purple-500'
                      )}
                    />
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-surface-700">Why?</h4>
                  {result.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-surface-600">
                      <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-lg text-sm text-surface-600">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Based on average lifespan data and the 50% replacement cost rule. Your situation may vary.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-surface-200">
                  <Button variant="secondary" className="flex-1" onClick={handleReset}>
                    Try Another
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

export default RepairReplaceCalculator;
