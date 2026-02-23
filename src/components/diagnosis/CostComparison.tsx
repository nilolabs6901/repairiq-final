'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { CostComparison as CostComparisonType, Difficulty } from '@/types';
import {
  X,
  DollarSign,
  Wrench,
  Users,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cn, getDifficultyLabel } from '@/lib/utils';

interface CostComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosisId: string;
  itemType: string;
  issueTitle: string;
  estimatedPartsCost?: string;
  difficulty?: Difficulty;
}

export function CostComparison({
  isOpen,
  onClose,
  diagnosisId,
  itemType,
  issueTitle,
  estimatedPartsCost,
  difficulty = 'medium',
}: CostComparisonProps) {
  const [comparison, setComparison] = useState<CostComparisonType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'diy' | 'professional' | 'replace' | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateComparison();
    }
  }, [isOpen, itemType, issueTitle, estimatedPartsCost, difficulty]);

  const generateComparison = () => {
    setIsLoading(true);

    // Parse parts cost
    const partsCostMatch = estimatedPartsCost?.match(/\$?(\d+)/);
    const baseParts = partsCostMatch ? parseInt(partsCostMatch[1]) : 50;

    // Generate realistic cost comparison based on item type and difficulty
    const laborMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2.5;
    const replacementCosts = getReplacementCosts(itemType);

    const generated: CostComparisonType = {
      diagnosisId,
      itemType,
      issueTitle,
      diyCost: {
        parts: baseParts,
        tools: difficulty === 'easy' ? 0 : difficulty === 'medium' ? 25 : 50,
        total: baseParts + (difficulty === 'easy' ? 0 : difficulty === 'medium' ? 25 : 50),
        estimatedTime: difficulty === 'easy' ? '30 min - 1 hour' : difficulty === 'medium' ? '1-2 hours' : '2-4 hours',
        difficulty,
        riskLevel: difficulty === 'easy' ? 'low' : difficulty === 'medium' ? 'medium' : 'high',
      },
      professionalRepair: {
        laborCost: {
          min: Math.round(75 * laborMultiplier),
          max: Math.round(150 * laborMultiplier),
        },
        partsCost: {
          min: Math.round(baseParts * 1.2),
          max: Math.round(baseParts * 1.5),
        },
        total: {
          min: Math.round(75 * laborMultiplier + baseParts * 1.2),
          max: Math.round(150 * laborMultiplier + baseParts * 1.5),
        },
        estimatedTime: '1-3 days',
        warranty: '90 days labor warranty',
      },
      replacement: {
        newItemCost: replacementCosts.itemCost,
        installationCost: replacementCosts.installCost,
        total: {
          min: replacementCosts.itemCost.min + (replacementCosts.installCost?.min || 0),
          max: replacementCosts.itemCost.max + (replacementCosts.installCost?.max || 0),
        },
        averageLifespan: replacementCosts.lifespan,
        energySavings: replacementCosts.energySavings,
      },
      recommendation: getRecommendation(difficulty, baseParts, replacementCosts),
      recommendationReason: getRecommendationReason(difficulty, baseParts, replacementCosts),
    };

    setTimeout(() => {
      setComparison(generated);
      setSelectedOption(generated.recommendation);
      setIsLoading(false);
    }, 500);
  };

  const getReplacementCosts = (type: string): {
    itemCost: { min: number; max: number };
    installCost?: { min: number; max: number };
    lifespan: string;
    energySavings?: string;
  } => {
    const costs: Record<string, any> = {
      refrigerator: {
        itemCost: { min: 800, max: 2500 },
        installCost: { min: 100, max: 200 },
        lifespan: '10-15 years',
        energySavings: 'New models use 40% less energy',
      },
      washer: {
        itemCost: { min: 500, max: 1500 },
        installCost: { min: 75, max: 150 },
        lifespan: '10-12 years',
        energySavings: 'New models use 25% less water',
      },
      dryer: {
        itemCost: { min: 400, max: 1200 },
        installCost: { min: 75, max: 150 },
        lifespan: '10-13 years',
        energySavings: 'Heat pump dryers use 50% less energy',
      },
      dishwasher: {
        itemCost: { min: 400, max: 1200 },
        installCost: { min: 100, max: 200 },
        lifespan: '9-12 years',
        energySavings: 'New models use 30% less water',
      },
      oven: {
        itemCost: { min: 500, max: 2000 },
        installCost: { min: 100, max: 300 },
        lifespan: '13-15 years',
      },
      microwave: {
        itemCost: { min: 100, max: 500 },
        lifespan: '7-10 years',
      },
      'water heater': {
        itemCost: { min: 600, max: 1500 },
        installCost: { min: 200, max: 500 },
        lifespan: '8-12 years',
        energySavings: 'Tankless heaters save $100+/year',
      },
      hvac: {
        itemCost: { min: 3000, max: 8000 },
        installCost: { min: 1000, max: 3000 },
        lifespan: '15-20 years',
        energySavings: 'New SEER ratings save 20-40%',
      },
    };

    const normalizedType = type.toLowerCase();
    return costs[normalizedType] || {
      itemCost: { min: 300, max: 1000 },
      installCost: { min: 50, max: 150 },
      lifespan: '10+ years',
    };
  };

  const getRecommendation = (
    difficulty: Difficulty,
    partsCost: number,
    replacement: ReturnType<typeof getReplacementCosts>
  ): 'diy' | 'professional' | 'replace' => {
    const diyCost = partsCost + (difficulty === 'easy' ? 0 : difficulty === 'medium' ? 25 : 50);
    const proCost = 75 * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2.5) + partsCost * 1.3;
    const replaceCost = replacement.itemCost.min;

    // If repair cost is more than 50% of replacement, recommend replace
    if (proCost > replaceCost * 0.5) {
      return 'replace';
    }

    // If difficulty is easy and cost is low, recommend DIY
    if (difficulty === 'easy' && diyCost < 100) {
      return 'diy';
    }

    // If difficulty is hard or professional is needed, recommend professional
    if (difficulty === 'hard' || difficulty === 'professional') {
      return 'professional';
    }

    // For medium difficulty, compare costs
    if (diyCost < proCost * 0.4) {
      return 'diy';
    }

    return 'professional';
  };

  const getRecommendationReason = (
    difficulty: Difficulty,
    partsCost: number,
    replacement: ReturnType<typeof getReplacementCosts>
  ): string => {
    const recommendation = getRecommendation(difficulty, partsCost, replacement);

    switch (recommendation) {
      case 'diy':
        return `This is a ${getDifficultyLabel(difficulty).toLowerCase()} repair with low parts cost. DIY saves you significant labor costs and can be completed in under 2 hours.`;
      case 'professional':
        return `Given the ${getDifficultyLabel(difficulty).toLowerCase()} difficulty level, hiring a professional ensures the repair is done correctly and typically includes a labor warranty.`;
      case 'replace':
        return `The repair cost approaches or exceeds 50% of replacement cost. A new unit offers better efficiency, warranty, and peace of mind.`;
      default:
        return '';
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
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">Cost Comparison</h2>
                  <p className="text-sm text-surface-500">{issueTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-surface-500">Calculating cost comparison...</p>
              </div>
            ) : comparison && (
              <div className="space-y-6">
                {/* Recommendation Banner */}
                <div className={cn(
                  'p-4 rounded-xl',
                  comparison.recommendation === 'diy' ? 'bg-green-50 border border-green-200' :
                  comparison.recommendation === 'professional' ? 'bg-blue-50 border border-blue-200' :
                  'bg-purple-50 border border-purple-200'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className={cn(
                      'w-5 h-5',
                      comparison.recommendation === 'diy' ? 'text-green-600' :
                      comparison.recommendation === 'professional' ? 'text-blue-600' :
                      'text-purple-600'
                    )} />
                    <span className="font-semibold text-surface-900">
                      Recommended: {comparison.recommendation === 'diy' ? 'DIY Repair' :
                        comparison.recommendation === 'professional' ? 'Professional Repair' : 'Replace'}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600">{comparison.recommendationReason}</p>
                </div>

                {/* Cost Options */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* DIY Option */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selectedOption === 'diy'
                        ? 'border-green-500 bg-green-50'
                        : 'border-surface-200 hover:border-surface-300'
                    )}
                    onClick={() => setSelectedOption('diy')}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-surface-900">DIY Repair</span>
                      {comparison.recommendation === 'diy' && (
                        <Badge variant="success" size="sm">Best Value</Badge>
                      )}
                    </div>

                    <div className="text-3xl font-bold text-surface-900 mb-2">
                      ${comparison.diyCost.total}
                    </div>

                    <div className="space-y-1 text-sm text-surface-600 mb-4">
                      <div className="flex justify-between">
                        <span>Parts</span>
                        <span>${comparison.diyCost.parts}</span>
                      </div>
                      {comparison.diyCost.tools > 0 && (
                        <div className="flex justify-between">
                          <span>Tools</span>
                          <span>${comparison.diyCost.tools}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-surface-600">
                        <Clock className="w-4 h-4" />
                        <span>{comparison.diyCost.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn(
                          'w-4 h-4',
                          comparison.diyCost.riskLevel === 'low' ? 'text-green-500' :
                          comparison.diyCost.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                        )} />
                        <span className="text-surface-600">
                          {comparison.diyCost.riskLevel.charAt(0).toUpperCase() + comparison.diyCost.riskLevel.slice(1)} risk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Option */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selectedOption === 'professional'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-surface-200 hover:border-surface-300'
                    )}
                    onClick={() => setSelectedOption('professional')}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-surface-900">Professional</span>
                      {comparison.recommendation === 'professional' && (
                        <Badge variant="info" size="sm">Recommended</Badge>
                      )}
                    </div>

                    <div className="text-3xl font-bold text-surface-900 mb-2">
                      ${comparison.professionalRepair.total.min} - ${comparison.professionalRepair.total.max}
                    </div>

                    <div className="space-y-1 text-sm text-surface-600 mb-4">
                      <div className="flex justify-between">
                        <span>Labor</span>
                        <span>${comparison.professionalRepair.laborCost.min}-${comparison.professionalRepair.laborCost.max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts</span>
                        <span>${comparison.professionalRepair.partsCost.min}-${comparison.professionalRepair.partsCost.max}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-surface-600">
                        <Clock className="w-4 h-4" />
                        <span>{comparison.professionalRepair.estimatedTime}</span>
                      </div>
                      {comparison.professionalRepair.warranty && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{comparison.professionalRepair.warranty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replace Option */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selectedOption === 'replace'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-surface-200 hover:border-surface-300'
                    )}
                    onClick={() => setSelectedOption('replace')}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-surface-900">Replace</span>
                      {comparison.recommendation === 'replace' && (
                        <Badge variant="warning" size="sm">Consider</Badge>
                      )}
                    </div>

                    <div className="text-3xl font-bold text-surface-900 mb-2">
                      ${comparison.replacement.total.min} - ${comparison.replacement.total.max}
                    </div>

                    <div className="space-y-1 text-sm text-surface-600 mb-4">
                      <div className="flex justify-between">
                        <span>New unit</span>
                        <span>${comparison.replacement.newItemCost.min}-${comparison.replacement.newItemCost.max}</span>
                      </div>
                      {comparison.replacement.installationCost && (
                        <div className="flex justify-between">
                          <span>Installation</span>
                          <span>${comparison.replacement.installationCost.min}-${comparison.replacement.installationCost.max}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-surface-600">
                        <Clock className="w-4 h-4" />
                        <span>{comparison.replacement.averageLifespan} lifespan</span>
                      </div>
                      {comparison.replacement.energySavings && (
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs">{comparison.replacement.energySavings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-lg text-sm text-surface-600">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Costs are estimates based on national averages. Actual prices may vary based on your location,
                    specific model, and service provider.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-surface-200">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  {selectedOption === 'professional' && (
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={<ChevronRight className="w-4 h-4" />}
                      onClick={() => {
                        window.location.href = `/professionals?category=${encodeURIComponent(itemType)}`;
                      }}
                    >
                      Find Professionals
                    </Button>
                  )}
                  {selectedOption === 'replace' && (
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={<ShoppingCart className="w-4 h-4" />}
                      onClick={() => {
                        window.open(`https://www.amazon.com/s?k=${encodeURIComponent(itemType)}`, '_blank');
                      }}
                    >
                      Shop Replacements
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CostComparison;
