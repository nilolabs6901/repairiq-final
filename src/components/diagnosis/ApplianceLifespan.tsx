'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import {
  X,
  Activity,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Shield,
  Clock,
  Info,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplianceLifespanProps {
  isOpen: boolean;
  onClose: () => void;
}

type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

interface LifespanResult {
  expectedLifespan: number;
  yearsRemaining: number;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  brandTier: 'premium' | 'mid-range' | 'budget' | 'unknown';
  insights: string[];
  maintenanceTips: string[];
}

interface ApplianceData {
  label: string;
  value: string;
  avgLifespan: number;
  brands: Record<string, { tier: 'premium' | 'mid-range' | 'budget'; lifespanModifier: number }>;
}

const APPLIANCES: ApplianceData[] = [
  {
    label: 'Refrigerator',
    value: 'refrigerator',
    avgLifespan: 13,
    brands: {
      'Sub-Zero': { tier: 'premium', lifespanModifier: 1.4 },
      'Thermador': { tier: 'premium', lifespanModifier: 1.25 },
      'Bosch': { tier: 'premium', lifespanModifier: 1.2 },
      'KitchenAid': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.05 },
      'LG': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.95 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Maytag': { tier: 'mid-range', lifespanModifier: 1.05 },
      'Frigidaire': { tier: 'budget', lifespanModifier: 0.9 },
      'Amana': { tier: 'budget', lifespanModifier: 0.85 },
    },
  },
  {
    label: 'Washing Machine',
    value: 'washer',
    avgLifespan: 11,
    brands: {
      'Miele': { tier: 'premium', lifespanModifier: 1.5 },
      'Speed Queen': { tier: 'premium', lifespanModifier: 1.45 },
      'Bosch': { tier: 'premium', lifespanModifier: 1.2 },
      'Maytag': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.05 },
      'LG': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.95 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Kenmore': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Amana': { tier: 'budget', lifespanModifier: 0.85 },
    },
  },
  {
    label: 'Dryer',
    value: 'dryer',
    avgLifespan: 12,
    brands: {
      'Miele': { tier: 'premium', lifespanModifier: 1.4 },
      'Speed Queen': { tier: 'premium', lifespanModifier: 1.4 },
      'Bosch': { tier: 'premium', lifespanModifier: 1.2 },
      'Maytag': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.05 },
      'LG': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.95 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Kenmore': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Amana': { tier: 'budget', lifespanModifier: 0.85 },
    },
  },
  {
    label: 'Dishwasher',
    value: 'dishwasher',
    avgLifespan: 10,
    brands: {
      'Miele': { tier: 'premium', lifespanModifier: 1.5 },
      'Bosch': { tier: 'premium', lifespanModifier: 1.3 },
      'Thermador': { tier: 'premium', lifespanModifier: 1.25 },
      'KitchenAid': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.05 },
      'Maytag': { tier: 'mid-range', lifespanModifier: 1.05 },
      'LG': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.9 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Frigidaire': { tier: 'budget', lifespanModifier: 0.85 },
    },
  },
  {
    label: 'Oven / Stove',
    value: 'oven',
    avgLifespan: 14,
    brands: {
      'Wolf': { tier: 'premium', lifespanModifier: 1.35 },
      'Viking': { tier: 'premium', lifespanModifier: 1.2 },
      'Thermador': { tier: 'premium', lifespanModifier: 1.25 },
      'Bosch': { tier: 'premium', lifespanModifier: 1.15 },
      'KitchenAid': { tier: 'mid-range', lifespanModifier: 1.1 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.95 },
      'LG': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Frigidaire': { tier: 'budget', lifespanModifier: 0.9 },
    },
  },
  {
    label: 'Microwave',
    value: 'microwave',
    avgLifespan: 9,
    brands: {
      'Bosch': { tier: 'premium', lifespanModifier: 1.2 },
      'KitchenAid': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Panasonic': { tier: 'mid-range', lifespanModifier: 1.1 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Whirlpool': { tier: 'mid-range', lifespanModifier: 1.0 },
      'LG': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Samsung': { tier: 'mid-range', lifespanModifier: 0.95 },
      'Frigidaire': { tier: 'budget', lifespanModifier: 0.85 },
    },
  },
  {
    label: 'HVAC / AC',
    value: 'hvac',
    avgLifespan: 17,
    brands: {
      'Trane': { tier: 'premium', lifespanModifier: 1.25 },
      'Carrier': { tier: 'premium', lifespanModifier: 1.2 },
      'Lennox': { tier: 'premium', lifespanModifier: 1.2 },
      'Rheem': { tier: 'mid-range', lifespanModifier: 1.05 },
      'Goodman': { tier: 'mid-range', lifespanModifier: 0.95 },
      'York': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Daikin': { tier: 'premium', lifespanModifier: 1.15 },
      'American Standard': { tier: 'mid-range', lifespanModifier: 1.1 },
    },
  },
  {
    label: 'Water Heater',
    value: 'water-heater',
    avgLifespan: 10,
    brands: {
      'Rinnai': { tier: 'premium', lifespanModifier: 1.3 },
      'Navien': { tier: 'premium', lifespanModifier: 1.25 },
      'A.O. Smith': { tier: 'mid-range', lifespanModifier: 1.1 },
      'Rheem': { tier: 'mid-range', lifespanModifier: 1.05 },
      'Bradford White': { tier: 'mid-range', lifespanModifier: 1.1 },
      'GE': { tier: 'mid-range', lifespanModifier: 1.0 },
      'Whirlpool': { tier: 'budget', lifespanModifier: 0.9 },
    },
  },
];

function calculateLifespan(
  applianceValue: string,
  brandName: string,
  ageYears: number
): LifespanResult {
  const appliance = APPLIANCES.find(a => a.value === applianceValue)!;
  const brandData = appliance.brands[brandName];

  const brandTier = brandData?.tier || 'unknown';
  const modifier = brandData?.lifespanModifier || 1.0;
  const expectedLifespan = Math.round(appliance.avgLifespan * modifier);
  const yearsRemaining = Math.max(0, expectedLifespan - ageYears);
  const agePercent = (ageYears / expectedLifespan) * 100;

  // Risk score: 0 = safe, 100 = imminent failure
  let riskScore: number;
  if (agePercent <= 40) {
    riskScore = Math.round(agePercent * 0.3); // 0-12
  } else if (agePercent <= 65) {
    riskScore = Math.round(12 + (agePercent - 40) * 0.8); // 12-32
  } else if (agePercent <= 85) {
    riskScore = Math.round(32 + (agePercent - 65) * 1.8); // 32-68
  } else if (agePercent <= 100) {
    riskScore = Math.round(68 + (agePercent - 85) * 2); // 68-98
  } else {
    riskScore = Math.min(99, Math.round(85 + (agePercent - 100) * 0.5));
  }

  // Budget brands degrade faster in later years
  if (brandTier === 'budget' && agePercent > 60) {
    riskScore = Math.min(99, riskScore + 8);
  }
  // Premium brands hold up better
  if (brandTier === 'premium' && agePercent > 50) {
    riskScore = Math.max(0, riskScore - 5);
  }

  let riskLevel: RiskLevel;
  if (riskScore < 15) riskLevel = 'low';
  else if (riskScore < 35) riskLevel = 'moderate';
  else if (riskScore < 55) riskLevel = 'elevated';
  else if (riskScore < 75) riskLevel = 'high';
  else riskLevel = 'critical';

  // Build insights
  const insights: string[] = [];

  if (brandTier === 'premium') {
    insights.push(`${brandName} is a premium brand known for longevity and reliability.`);
  } else if (brandTier === 'mid-range') {
    insights.push(`${brandName} is a solid mid-range brand with average reliability ratings.`);
  } else if (brandTier === 'budget') {
    insights.push(`${brandName} is a budget brand — appliances may need more frequent repairs after year ${Math.round(expectedLifespan * 0.5)}.`);
  } else {
    insights.push(`Brand data not available — estimates are based on category averages.`);
  }

  if (yearsRemaining > 5) {
    insights.push(`With ~${yearsRemaining} years of expected life remaining, this appliance is in good shape.`);
  } else if (yearsRemaining > 2) {
    insights.push(`With ~${yearsRemaining} years left, start budgeting for a replacement in the next few years.`);
  } else if (yearsRemaining > 0) {
    insights.push(`Only ~${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'} of expected life left. Consider shopping for replacements proactively.`);
  } else {
    insights.push(`This appliance has exceeded its expected lifespan. Every extra year is a bonus, but be prepared for it to fail.`);
  }

  if (agePercent >= 70 && agePercent < 100) {
    insights.push('Repair costs tend to increase sharply in this age range. Weigh each repair carefully.');
  }

  // Maintenance tips
  const maintenanceTips = getMaintenanceTips(applianceValue, agePercent);

  return {
    expectedLifespan,
    yearsRemaining,
    riskLevel,
    riskScore,
    brandTier,
    insights,
    maintenanceTips,
  };
}

function getMaintenanceTips(applianceType: string, agePercent: number): string[] {
  const tips: Record<string, string[]> = {
    refrigerator: [
      'Clean condenser coils every 6-12 months',
      'Check and replace door gaskets if they feel loose',
      'Keep the fridge 2/3 full for optimal efficiency',
    ],
    washer: [
      'Run a cleaning cycle monthly with washer cleaner or vinegar',
      'Inspect hoses yearly and replace every 5 years',
      'Leave the door ajar after use to prevent mold',
    ],
    dryer: [
      'Clean the lint trap after every load',
      'Deep clean the vent duct annually',
      'Check the drum seal for wear',
    ],
    dishwasher: [
      'Clean the filter monthly',
      'Run an empty hot cycle with vinegar quarterly',
      'Inspect the spray arms for clogs',
    ],
    oven: [
      'Use self-clean sparingly (2-3 times/year max)',
      'Check the door seal for heat leaks',
      'Calibrate the temperature if food cooks unevenly',
    ],
    microwave: [
      'Clean interior regularly to prevent arcing',
      'Test the door seal by placing a phone inside (should lose signal)',
      'Replace if the door latch feels loose',
    ],
    hvac: [
      'Replace air filters every 1-3 months',
      'Schedule professional maintenance twice yearly',
      'Keep outdoor unit clear of debris (2 ft clearance)',
    ],
    'water-heater': [
      'Flush the tank annually to remove sediment',
      'Test the pressure relief valve every 6 months',
      'Check the anode rod every 2-3 years',
    ],
  };

  const baseTips = tips[applianceType] || ['Follow the manufacturer maintenance schedule'];

  if (agePercent > 70) {
    baseTips.push('At this age, consider having a professional inspection done annually');
  }

  return baseTips;
}

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string; label: string; icon: typeof CheckCircle }> = {
  low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Low Risk', icon: CheckCircle },
  moderate: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Moderate', icon: Shield },
  elevated: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Elevated', icon: AlertTriangle },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High Risk', icon: AlertTriangle },
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical', icon: AlertCircle },
};

export function ApplianceLifespan({ isOpen, onClose }: ApplianceLifespanProps) {
  const [applianceType, setApplianceType] = useState('');
  const [brand, setBrand] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [showApplianceDropdown, setShowApplianceDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [result, setResult] = useState<LifespanResult | null>(null);

  const selectedAppliance = APPLIANCES.find(a => a.value === applianceType);
  const availableBrands = selectedAppliance
    ? [...Object.keys(selectedAppliance.brands), 'Other']
    : [];
  const canCalculate = applianceType && brand && ageYears && Number(ageYears) >= 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    setResult(calculateLifespan(applianceType, brand, Number(ageYears)));
  };

  const handleReset = () => {
    setApplianceType('');
    setBrand('');
    setAgeYears('');
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setResult(null);
      setApplianceType('');
      setBrand('');
      setAgeYears('');
    }, 300);
  };

  const handleApplianceChange = (value: string) => {
    setApplianceType(value);
    setBrand(''); // reset brand when appliance changes
    setShowApplianceDropdown(false);
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-900">Appliance Lifespan</h2>
                  <p className="text-sm text-surface-500">Brand reliability & risk score</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {!result ? (
              <div className="space-y-4">
                {/* Appliance Type */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Appliance type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowApplianceDropdown(!showApplianceDropdown); setShowBrandDropdown(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-surface-300 transition-colors touch-manipulation"
                    >
                      <span className={applianceType ? 'text-surface-900' : 'text-surface-400'}>
                        {selectedAppliance?.label || 'Select an appliance...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-surface-400" />
                    </button>
                    {showApplianceDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        {APPLIANCES.map(a => (
                          <button
                            key={a.value}
                            onClick={() => handleApplianceChange(a.value)}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {a.label}
                            <span className="text-surface-400 ml-2">({a.avgLifespan} yr avg)</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Brand
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowBrandDropdown(!showBrandDropdown); setShowApplianceDropdown(false); }}
                      disabled={!applianceType}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-surface-300 transition-colors touch-manipulation',
                        !applianceType && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className={brand ? 'text-surface-900' : 'text-surface-400'}>
                        {brand || 'Select a brand...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-surface-400" />
                    </button>
                    {showBrandDropdown && availableBrands.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        {availableBrands.map(b => {
                          const bData = selectedAppliance?.brands[b];
                          return (
                            <button
                              key={b}
                              onClick={() => { setBrand(b); setShowBrandDropdown(false); }}
                              className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center justify-between"
                            >
                              <span>{b}</span>
                              {bData && (
                                <span className={cn(
                                  'text-xs px-2 py-0.5 rounded-full',
                                  bData.tier === 'premium' ? 'bg-yellow-100 text-yellow-700' :
                                  bData.tier === 'mid-range' ? 'bg-blue-100 text-blue-700' :
                                  'bg-surface-100 text-surface-600'
                                )}>
                                  {bData.tier}
                                </span>
                              )}
                            </button>
                          );
                        })}
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
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 border border-surface-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                  icon={<Activity className="w-5 h-5" />}
                  onClick={handleCalculate}
                  disabled={!canCalculate}
                >
                  Check Lifespan
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Risk Score Header */}
                {(() => {
                  const config = RISK_CONFIG[result.riskLevel];
                  const RiskIcon = config.icon;
                  return (
                    <div className={cn('p-5 rounded-xl text-center', config.bg, 'border', config.border)}>
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          <svg className="w-24 h-24" viewBox="0 0 100 100">
                            <circle
                              cx="50" cy="50" r="42"
                              fill="none"
                              stroke="currentColor"
                              className="text-surface-200"
                              strokeWidth="8"
                            />
                            <motion.circle
                              cx="50" cy="50" r="42"
                              fill="none"
                              stroke="currentColor"
                              className={config.color}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 42}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.riskScore / 100) }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn('text-2xl font-bold', config.color)}>{result.riskScore}</span>
                            <span className="text-xs text-surface-500">/ 100</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <RiskIcon className={cn('w-5 h-5', config.color)} />
                        <h3 className={cn('text-lg font-bold', config.color)}>{config.label}</h3>
                      </div>
                      <p className="text-sm text-surface-600">
                        Failure risk based on age, brand, and category averages
                      </p>
                    </div>
                  );
                })()}

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <Clock className="w-4 h-4 text-surface-400 mx-auto mb-1" />
                    <p className="text-xs text-surface-500">Expected Life</p>
                    <p className="text-lg font-bold text-surface-900">{result.expectedLifespan} yr</p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <TrendingUp className="w-4 h-4 text-surface-400 mx-auto mb-1" />
                    <p className="text-xs text-surface-500">Years Left</p>
                    <p className="text-lg font-bold text-surface-900">
                      {result.yearsRemaining > 0 ? `~${result.yearsRemaining}` : '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-xl text-center">
                    <Shield className="w-4 h-4 text-surface-400 mx-auto mb-1" />
                    <p className="text-xs text-surface-500">Brand Tier</p>
                    <p className={cn(
                      'text-sm font-bold capitalize',
                      result.brandTier === 'premium' ? 'text-yellow-600' :
                      result.brandTier === 'mid-range' ? 'text-blue-600' :
                      result.brandTier === 'budget' ? 'text-surface-600' :
                      'text-surface-400'
                    )}>
                      {result.brandTier}
                    </p>
                  </div>
                </div>

                {/* Lifespan Bar */}
                <div>
                  <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                    <span>New</span>
                    <span>{ageYears} yr old</span>
                    <span>{result.expectedLifespan} yr</span>
                  </div>
                  <div className="h-3 bg-surface-100 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (Number(ageYears) / result.expectedLifespan) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        result.riskScore < 35 ? 'bg-green-500' :
                        result.riskScore < 55 ? 'bg-amber-500' :
                        result.riskScore < 75 ? 'bg-orange-500' :
                        'bg-red-500'
                      )}
                    />
                  </div>
                </div>

                {/* Insights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-surface-700">Insights</h4>
                  {result.insights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-surface-600">
                      <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>

                {/* Maintenance Tips */}
                <div className="p-4 bg-surface-50 rounded-xl space-y-2">
                  <h4 className="text-sm font-semibold text-surface-700">Maintenance Tips</h4>
                  {result.maintenanceTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-surface-600">
                      <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
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

export default ApplianceLifespan;
