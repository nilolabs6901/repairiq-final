'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult } from '@/types';
import { SkillAssessment, SkillResult } from '@/components/diagnosis/SkillAssessment';
import { SafetyGuard } from '@/components/diagnosis/SafetyGuard';
import { CostComparison } from '@/components/diagnosis/CostComparison';
import { RepairAssistant } from '@/components/diagnosis/RepairAssistant';
import { SmartPartsList } from '@/components/diagnosis/SmartPartsList';
import { RepairVideoHub } from '@/components/diagnosis/RepairVideoHub';
import { RepairCheckpoint } from '@/components/diagnosis/RepairCheckpoint';
import { RepairReplaceCalculator } from '@/components/diagnosis/RepairReplaceCalculator';
import { getSavedRepairs } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import {
  Wrench,
  Bot,
  ListChecks,
  Youtube,
  Shield,
  Target,
  Flag,
  DollarSign,
  MessageCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Hammer,
  Send,
  CheckCircle,
  ChevronDown,
  Calculator,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
  needsDiagnosis: boolean;
}

const TOOLS: ToolCard[] = [
  {
    id: 'ai-chat',
    title: 'AI Repair Chat',
    description: 'Get real-time AI guidance as you work through your repair step by step',
    icon: Bot,
    color: 'bg-brand-100',
    iconColor: 'text-brand-600',
    needsDiagnosis: true,
  },
  {
    id: 'parts',
    title: 'Parts & Shopping',
    description: 'Interactive checklist with quantity controls and links to Amazon, Home Depot, & more',
    icon: ListChecks,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    needsDiagnosis: true,
  },
  {
    id: 'videos',
    title: 'Video Tutorials',
    description: 'Watch curated repair walkthroughs and step-by-step video guides',
    icon: Youtube,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    needsDiagnosis: true,
  },
  {
    id: 'safety',
    title: 'Safety Checklist',
    description: 'Context-aware safety alerts, emergency contacts, and pre-repair steps',
    icon: Shield,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    needsDiagnosis: true,
  },
  {
    id: 'skill',
    title: 'Skill Assessment',
    description: 'Quick 5-question quiz to see if you can handle this repair yourself',
    icon: Target,
    color: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    needsDiagnosis: false,
  },
  {
    id: 'progress',
    title: 'Track Progress',
    description: 'Save and resume your repair with a built-in timer and step tracker',
    icon: Flag,
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    needsDiagnosis: true,
  },
  {
    id: 'cost',
    title: 'Cost Comparison',
    description: 'Compare DIY cost vs hiring a professional vs buying a replacement',
    icon: DollarSign,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    needsDiagnosis: false,
  },
  {
    id: 'repair-replace',
    title: 'Repair vs. Replace',
    description: 'Enter your appliance age and repair cost to find out if fixing or replacing is smarter',
    icon: Calculator,
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
    needsDiagnosis: false,
  },
  {
    id: 'tech',
    title: 'Live Tech Support',
    description: 'Connect with a certified technician via video call for hands-on guidance',
    icon: MessageCircle,
    color: 'bg-violet-100',
    iconColor: 'text-violet-600',
    needsDiagnosis: false,
  },
];

const APPLIANCE_TYPES = [
  'Washing Machine', 'Dryer', 'Dishwasher', 'Refrigerator', 'Oven/Stove',
  'Microwave', 'HVAC/AC', 'Water Heater', 'Garbage Disposal', 'Plumbing',
  'Electrical', 'Garage Door', 'Other',
];

function createQuickContext(applianceType: string, issueDescription: string): DiagnosisResult {
  return {
    id: generateId(),
    itemType: applianceType.toLowerCase(),
    itemDescription: `${applianceType} - ${issueDescription}`,
    summary: issueDescription,
    likelyIssues: [
      {
        id: generateId(),
        title: issueDescription,
        description: `User-reported issue with ${applianceType}: ${issueDescription}`,
        probability: 80,
        difficulty: 'medium',
        confidenceScore: 60,
        confidenceReason: 'Based on user description only (no AI diagnosis)',
      },
    ],
    troubleshootingSteps: [
      {
        id: generateId(),
        stepNumber: 1,
        title: 'Research the issue',
        description: `Look up "${issueDescription}" for your ${applianceType} model to understand common causes.`,
        estimatedTime: '10-15 min',
        difficulty: 'easy',
      },
      {
        id: generateId(),
        stepNumber: 2,
        title: 'Gather tools and parts',
        description: 'Based on your research, collect the tools and replacement parts you may need.',
        estimatedTime: '15-30 min',
        difficulty: 'easy',
      },
      {
        id: generateId(),
        stepNumber: 3,
        title: 'Perform the repair',
        description: 'Follow the repair guide or video tutorial. Use the AI chat if you get stuck.',
        estimatedTime: '30-60 min',
        difficulty: 'medium',
      },
    ],
    partsNeeded: [],
    estimatedTotalTime: '1-2 hours',
    estimatedTotalCost: '$20-100',
    shouldCallProfessional: false,
    overallConfidence: 60,
    confidenceFactors: {
      informationQuality: 50,
      symptomClarity: 60,
      patternMatch: 70,
    },
    youtubeVideos: [],
    createdAt: new Date(),
  };
}

export default function ToolkitPage() {
  const [recentDiagnosis, setRecentDiagnosis] = useState<DiagnosisResult | null>(null);
  const [showRepairAssistant, setShowRepairAssistant] = useState(false);
  const [showPartsList, setShowPartsList] = useState(false);
  const [showVideoHub, setShowVideoHub] = useState(false);
  const [showSafetyGuard, setShowSafetyGuard] = useState(false);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showCostComparison, setShowCostComparison] = useState(false);
  const [showRepairReplace, setShowRepairReplace] = useState(false);
  const [skillResult, setSkillResult] = useState<SkillResult | null>(null);
  const [noDiagnosisAlert, setNoDiagnosisAlert] = useState<string | null>(null);

  // Quick issue input
  const [selectedType, setSelectedType] = useState('');
  const [issueText, setIssueText] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isManualContext, setIsManualContext] = useState(false);

  useEffect(() => {
    const saved = getSavedRepairs();
    if (saved.length > 0) {
      setRecentDiagnosis(saved[0]);
    }
  }, []);

  const handleQuickSubmit = () => {
    if (!selectedType || !issueText.trim()) return;
    const context = createQuickContext(selectedType, issueText.trim());
    setRecentDiagnosis(context);
    setIsManualContext(true);
  };

  const handleToolClick = (tool: ToolCard) => {
    if (tool.needsDiagnosis && !recentDiagnosis) {
      setNoDiagnosisAlert(tool.title);
      setTimeout(() => setNoDiagnosisAlert(null), 3000);
      return;
    }

    switch (tool.id) {
      case 'ai-chat': setShowRepairAssistant(true); break;
      case 'parts': setShowPartsList(true); break;
      case 'videos': setShowVideoHub(true); break;
      case 'safety': setShowSafetyGuard(true); break;
      case 'skill': setShowSkillAssessment(true); break;
      case 'progress': setShowCheckpoint(true); break;
      case 'cost': setShowCostComparison(true); break;
      case 'repair-replace': setShowRepairReplace(true); break;
      case 'tech':
        window.open('https://www.justanswer.com/appliance/', '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge
              variant="info"
              size="lg"
              className="mb-6"
              icon={<Hammer className="w-4 h-4" />}
            >
              Self-Repair Toolkit
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-surface-900 mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                fix it yourself
              </span>
            </h1>
            <p className="text-lg text-surface-600 mb-8 max-w-2xl mx-auto">
              Tell us what&apos;s wrong and unlock AI chat, parts lists, video tutorials,
              safety checklists, and more.
            </p>
          </motion.div>

          {/* Quick Issue Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            {recentDiagnosis ? (
              <Card padding="md" className="bg-white border-brand-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-surface-500">
                        {isManualContext ? 'Your issue' : 'From saved diagnosis'}
                      </p>
                      <p className="font-semibold text-surface-900">{recentDiagnosis.itemDescription}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setRecentDiagnosis(null); setIsManualContext(false); setSelectedType(''); setIssueText(''); }}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </Card>
            ) : (
              <Card padding="lg" className="bg-white shadow-lg border-surface-200">
                <h3 className="font-semibold text-surface-900 mb-4 text-center">
                  What are you trying to fix?
                </h3>
                <div className="space-y-3">
                  {/* Appliance Type Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-surface-200 rounded-xl text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-surface-300 transition-colors touch-manipulation"
                    >
                      <span className={selectedType ? 'text-surface-900' : 'text-surface-400'}>
                        {selectedType || 'Select appliance or system...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-surface-400" />
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        {APPLIANCE_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => { setSelectedType(type); setShowTypeDropdown(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-50 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Issue Description */}
                  <div className="relative">
                    <input
                      type="text"
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleQuickSubmit(); }}
                      placeholder="Describe the problem (e.g. &quot;not draining water&quot;)"
                      className="w-full px-4 py-3 pr-24 border border-surface-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Send className="w-4 h-4" />}
                      onClick={handleQuickSubmit}
                      disabled={!selectedType || !issueText.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Go
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-surface-400 text-center mt-3">
                  Or <Link href="/diagnose" className="text-indigo-600 font-medium hover:underline">run a full AI diagnosis</Link> for more accurate results
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* No Diagnosis Alert Toast */}
      {noDiagnosisAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500 text-white rounded-xl shadow-lg font-medium text-sm"
        >
          "{noDiagnosisAlert}" requires a diagnosis first.{' '}
          <Link href="/diagnose" className="underline font-bold">Start one now</Link>
        </motion.div>
      )}

      {/* Tools Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const disabled = tool.needsDiagnosis && !recentDiagnosis;

              return (
                <motion.div key={tool.id} variants={item}>
                  <Card
                    hover={!disabled}
                    padding="lg"
                    className={`h-full cursor-pointer transition-all ${disabled ? 'opacity-60' : ''}`}
                    onClick={() => handleToolClick(tool)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-surface-900">{tool.title}</h3>
                          {disabled && (
                            <Badge variant="warning" size="sm">Needs Diagnosis</Badge>
                          )}
                        </div>
                        <p className="text-sm text-surface-500">{tool.description}</p>
                        {tool.id === 'skill' && skillResult && (
                          <div className="mt-2">
                            <Badge
                              variant={skillResult.level === 'advanced' ? 'success' : skillResult.level === 'intermediate' ? 'warning' : 'info'}
                              size="sm"
                            >
                              Level: {skillResult.level}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card padding="lg" className="bg-gradient-to-br from-brand-50 to-indigo-50 border-brand-200">
            <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">
              Not sure what&apos;s wrong?
            </h2>
            <p className="text-surface-600 mb-6 max-w-lg mx-auto">
              Start with our AI diagnosis to identify the problem, then come back here with the right tools to fix it.
            </p>
            <Link href="/diagnose">
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
              >
                Start Free Diagnosis
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      {recentDiagnosis && (
        <>
          <RepairAssistant
            result={recentDiagnosis}
            isOpen={showRepairAssistant}
            onClose={() => setShowRepairAssistant(false)}
          />
          <SmartPartsList
            result={recentDiagnosis}
            isOpen={showPartsList}
            onClose={() => setShowPartsList(false)}
          />
          <RepairVideoHub
            result={recentDiagnosis}
            isOpen={showVideoHub}
            onClose={() => setShowVideoHub(false)}
          />
          <SafetyGuard
            result={recentDiagnosis}
            isOpen={showSafetyGuard}
            onClose={() => setShowSafetyGuard(false)}
          />
          <RepairCheckpoint
            result={recentDiagnosis}
            isOpen={showCheckpoint}
            onClose={() => setShowCheckpoint(false)}
          />
        </>
      )}

      <SkillAssessment
        isOpen={showSkillAssessment}
        onClose={() => setShowSkillAssessment(false)}
        repairDifficulty={recentDiagnosis?.likelyIssues[0]?.difficulty || 'medium'}
        onComplete={(result) => setSkillResult(result)}
      />

      <CostComparison
        isOpen={showCostComparison}
        onClose={() => setShowCostComparison(false)}
        diagnosisId={recentDiagnosis?.id || ''}
        itemType={recentDiagnosis?.itemType || 'appliance'}
        issueTitle={recentDiagnosis?.likelyIssues[0]?.title || 'General repair'}
        estimatedPartsCost={recentDiagnosis?.estimatedTotalCost || '$50-100'}
        difficulty={recentDiagnosis?.likelyIssues[0]?.difficulty}
      />

      <RepairReplaceCalculator
        isOpen={showRepairReplace}
        onClose={() => setShowRepairReplace(false)}
      />
    </div>
  );
}
