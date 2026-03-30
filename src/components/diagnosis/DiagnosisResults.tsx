'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn, getDifficultyColor, getDifficultyLabel } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { LocalProfessionals } from './LocalProfessionals';
import { VirtualTechConnect } from './VirtualTechConnect';
import { VoiceGuidedRepair } from './VoiceGuidedRepair';
import { RateApp } from './RateApp';
import { RepairAssistant } from './RepairAssistant';
import { SmartPartsList } from './SmartPartsList';
import { RepairVideoHub } from './RepairVideoHub';
import { SkillAssessment, SkillResult } from './SkillAssessment';
import { RepairCheckpoint } from './RepairCheckpoint';
import { SafetyGuard } from './SafetyGuard';
import { CostComparison } from './CostComparison';
import { RepairReplaceCalculator } from './RepairReplaceCalculator';
import { ApplianceLifespan } from './ApplianceLifespan';
import { QuickFeedback } from './QuickFeedback';
import { WeeklyTipSignup } from './WeeklyTipSignup';
import { SaveDiagnosis } from './SaveDiagnosis';
import { DiagnosisResult, LikelyIssue, TroubleshootingStep, Part, YouTubeVideo, AppRating } from '@/types';
import { hasRatedDiagnosis } from '@/lib/storage';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ExternalLink,
  Wrench,
  ShoppingCart,
  Phone,
  Share2,
  Bookmark,
  Youtube,
  ChevronRight,
  AlertCircle,
  Lightbulb,
  BookmarkCheck,
  Gauge,
  Info,
  ThumbsUp,
  Store,
  ClipboardCheck,
  Volume2,
  Headphones,
  Play,
  Star,
  Bot,
  ListChecks,
  Youtube as YoutubeIcon,
  Shield,
  Target,
  Flag,
  DollarSign as DollarIcon,
  MessageCircle,
  Calculator,
  Activity,
} from 'lucide-react';

interface DiagnosisResultsProps {
  result: DiagnosisResult;
  onSave?: () => void;
  onShare?: () => void;
  onReportOutcome?: () => void;
  isSaved?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Helper to get confidence color
function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-brand-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getConfidenceBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-brand-100';
  if (score >= 40) return 'bg-amber-100';
  return 'bg-red-100';
}

function getConfidenceLabel(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Low';
  return 'Very Low';
}

// Generate affiliate links for a part
function getAffiliateLinks(part: Part): { name: string; url: string; logo: string }[] {
  const searchTerm = encodeURIComponent(part.partNumber ? `${part.name} ${part.partNumber}` : part.name);
  return [
    { name: 'Amazon', url: `https://amazon.com/s?k=${searchTerm}`, logo: '/amazon-logo.png' },
    { name: 'Home Depot', url: `https://homedepot.com/s/${searchTerm}`, logo: '/homedepot-logo.png' },
    { name: "Lowe's", url: `https://lowes.com/search?searchTerm=${searchTerm}`, logo: '/lowes-logo.png' },
  ];
}

function ConfidenceIndicator({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', getConfidenceBgColor(score))} />
      <span className={cn('text-sm font-medium', getConfidenceColor(score))}>
        {score}% {label}
      </span>
    </div>
  );
}

function IssueCard({ issue, rank }: { issue: LikelyIssue; rank: number }) {
  const [showConfidence, setShowConfidence] = useState(false);

  return (
    <motion.div variants={item}>
      <Card padding="md" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-brand-600" />
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-brand-600">#{rank}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-semibold text-surface-900">{issue.title}</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfidence(!showConfidence)}
                  className={cn(
                    'p-1 rounded-lg transition-colors',
                    showConfidence ? 'bg-brand-100 text-brand-600' : 'text-surface-400 hover:text-surface-600'
                  )}
                  title="View confidence details"
                >
                  <Gauge className="w-4 h-4" />
                </button>
                <Badge
                  variant={
                    issue.difficulty === 'easy'
                      ? 'success'
                      : issue.difficulty === 'medium'
                      ? 'warning'
                      : issue.difficulty === 'hard'
                      ? 'danger'
                      : 'info'
                  }
                  size="sm"
                >
                  {getDifficultyLabel(issue.difficulty)}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-surface-600 mb-3">{issue.description}</p>

            {/* Confidence details */}
            {showConfidence && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-3 p-3 bg-surface-50 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className={cn('w-4 h-4', getConfidenceColor(issue.confidenceScore))} />
                  <span className={cn('text-sm font-semibold', getConfidenceColor(issue.confidenceScore))}>
                    {issue.confidenceScore}% Confidence ({getConfidenceLabel(issue.confidenceScore)})
                  </span>
                </div>
                {issue.confidenceReason && (
                  <p className="text-xs text-surface-500">{issue.confidenceReason}</p>
                )}
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${issue.probability}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-sm font-medium text-brand-600">{issue.probability}%</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function StepCard({ step }: { step: TroubleshootingStep }) {
  return (
    <motion.div variants={item}>
      <Card padding="md" className="relative">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
              {step.stepNumber}
            </div>
            <div className="w-0.5 flex-1 bg-surface-200 mt-2" />
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-semibold text-surface-900">{step.title}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" size="sm" icon={<Clock className="w-3 h-3" />}>
                  {step.estimatedTime}
                </Badge>
                <Badge
                  variant={
                    step.difficulty === 'easy'
                      ? 'success'
                      : step.difficulty === 'medium'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {getDifficultyLabel(step.difficulty)}
                </Badge>
              </div>
            </div>
            <p className="text-surface-600 mb-4">{step.description}</p>

            {step.tips && step.tips.length > 0 && (
              <div className="bg-brand-50 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 text-brand-700 font-medium mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm">Pro Tips</span>
                </div>
                <div className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <p key={i} className="text-sm text-brand-800">{tip}</p>
                  ))}
                </div>
              </div>
            )}

            {step.warnings && step.warnings.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Safety Warning</span>
                </div>
                <div className="space-y-1">
                  {step.warnings.map((warning, i) => (
                    <p key={i} className="text-sm text-amber-800">{warning}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PartCard({ part }: { part: Part }) {
  const [showStores, setShowStores] = useState(false);
  const affiliateLinks = getAffiliateLinks(part);

  return (
    <motion.div variants={item}>
      <Card padding="sm" hover className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-5 h-5 text-surface-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-surface-900 truncate">{part.name}</h4>
              {part.required && (
                <Badge variant="danger" size="sm">Required</Badge>
              )}
            </div>
            {part.partNumber && (
              <p className="text-xs text-surface-400 font-mono">Part #: {part.partNumber}</p>
            )}
            <p className="text-sm text-surface-500">{part.where_to_buy}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-surface-900">{part.estimatedCost}</p>
            <button
              onClick={() => setShowStores(!showStores)}
              className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Store className="w-3 h-3" />
              {showStores ? 'Hide' : 'Shop'}
            </button>
          </div>
        </div>

        {/* Affiliate store links */}
        {showStores && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex gap-2 pt-2 border-t border-surface-100"
          >
            {affiliateLinks.map((store) => (
              <a
                key={store.name}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-sm font-medium text-surface-700 transition-colors"
              >
                {store.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

function VideoCard({ video }: { video: YouTubeVideo }) {
  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors group"
    >
      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Youtube className="w-8 h-8 text-red-500" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
          {video.duration}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-surface-900 group-hover:text-brand-600 line-clamp-2 text-sm">
          {video.title}
        </h4>
        <p className="text-xs text-surface-500 mt-1">{video.channelName}</p>
        <p className="text-xs text-surface-400 mt-0.5">{formatViewCount(video.viewCount)} views</p>
      </div>
      <ExternalLink className="w-4 h-4 text-surface-400 group-hover:text-brand-500 flex-shrink-0" />
    </a>
  );
}

export function DiagnosisResults({ result, onSave, onShare, onReportOutcome, isSaved }: DiagnosisResultsProps) {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);
  const [hasRated, setHasRated] = useState(() => hasRatedDiagnosis(result.id));
  const [showRepairAssistant, setShowRepairAssistant] = useState(false);
  const [showPartsList, setShowPartsList] = useState(false);
  const [showVideoHub, setShowVideoHub] = useState(false);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [showSafetyGuard, setShowSafetyGuard] = useState(false);
  const [showCostComparison, setShowCostComparison] = useState(false);
  const [showRepairReplace, setShowRepairReplace] = useState(false);
  const [showLifespan, setShowLifespan] = useState(false);
  const [skillResult, setSkillResult] = useState<SkillResult | null>(null);

  const handleRatingSubmit = (rating: AppRating) => {
    setHasRated(true);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Summary Header */}
      <motion.div variants={item}>
        <Card variant="glass" padding="lg" className="bg-gradient-to-br from-brand-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                  Diagnosis Complete
                </Badge>
                <Badge
                  variant="outline"
                  icon={<Gauge className="w-3 h-3" />}
                  className={getConfidenceColor(result.overallConfidence)}
                >
                  {result.overallConfidence}% Confidence
                </Badge>
              </div>
              <h2 className="text-2xl font-display font-bold text-surface-900 mb-2">
                {result.itemDescription}
              </h2>
              <p className="text-surface-600">{result.summary}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                icon={isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                onClick={onSave}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<Share2 className="w-4 h-4" />}
                onClick={onShare}
              >
                Share
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-surface-200">
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-1">Est. Time</p>
              <p className="text-lg font-semibold text-surface-900 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-brand-500" />
                {result.estimatedTotalTime}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-1">Est. Cost</p>
              <p className="text-lg font-semibold text-surface-900 flex items-center justify-center gap-1">
                <DollarSign className="w-4 h-4 text-brand-500" />
                {result.estimatedTotalCost}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-1">Likely Issues</p>
              <p className="text-lg font-semibold text-surface-900">
                {result.likelyIssues.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-1">Parts Needed</p>
              <p className="text-lg font-semibold text-surface-900">
                {result.partsNeeded.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-1">Confidence</p>
              <button
                onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                className={cn(
                  'text-lg font-semibold flex items-center justify-center gap-1',
                  getConfidenceColor(result.overallConfidence)
                )}
              >
                <Gauge className="w-4 h-4" />
                {result.overallConfidence}%
              </button>
            </div>
          </div>

          {/* Confidence Details */}
          {showConfidenceDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-surface-200"
            >
              <h4 className="text-sm font-medium text-surface-700 mb-3">Confidence Breakdown</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs text-surface-500 mb-1">Information Quality</p>
                  <p className={cn('text-lg font-semibold', getConfidenceColor(result.confidenceFactors.informationQuality))}>
                    {result.confidenceFactors.informationQuality}%
                  </p>
                </div>
                <div className="text-center p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs text-surface-500 mb-1">Symptom Clarity</p>
                  <p className={cn('text-lg font-semibold', getConfidenceColor(result.confidenceFactors.symptomClarity))}>
                    {result.confidenceFactors.symptomClarity}%
                  </p>
                </div>
                <div className="text-center p-3 bg-surface-50 rounded-lg">
                  <p className="text-xs text-surface-500 mb-1">Pattern Match</p>
                  <p className={cn('text-lg font-semibold', getConfidenceColor(result.confidenceFactors.patternMatch))}>
                    {result.confidenceFactors.patternMatch}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Professional Warning */}
      {result.shouldCallProfessional && (
        <motion.div variants={item}>
          <Card padding="lg" className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  Consider Calling a Professional
                </h3>
                <p className="text-amber-800">{result.professionalReason}</p>
                <Link href={`/professionals?category=${encodeURIComponent(result.itemType)}&issue=${encodeURIComponent(result.likelyIssues[0]?.title || '')}`}>
                  <Button
                    variant="secondary"
                    size="md"
                    className="mt-4"
                    icon={<Phone className="w-4 h-4" />}
                  >
                    Find Local Professionals
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Likely Issues */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-surface-900">
            Likely Issues
          </h3>
          <Badge variant="outline">{result.likelyIssues.length} identified</Badge>
        </div>
        <div className="space-y-3">
          {result.likelyIssues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} rank={index + 1} />
          ))}
        </div>
      </motion.section>

      {/* Troubleshooting Steps */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-surface-900">
            Step-by-Step Guide
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{result.troubleshootingSteps.length} steps</Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<Headphones className="w-4 h-4" />}
              onClick={() => setShowVoiceGuide(true)}
            >
              Voice Guide
            </Button>
          </div>
        </div>

        {/* Voice Guide CTA Card */}
        <Card padding="md" className="mb-4 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-violet-900">Hands-Free Voice-Guided Repair</h4>
              <p className="text-sm text-violet-700">
                Let our AI read each step aloud while you work. Use voice commands like "next", "repeat", or "back" for hands-free navigation.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              icon={<Play className="w-4 h-4" />}
              onClick={() => setShowVoiceGuide(true)}
              className="flex-shrink-0"
            >
              Start
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {result.troubleshootingSteps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </motion.section>

      {/* Self-Repair Toolkit */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-surface-900">
            Self-Repair Toolkit
          </h3>
          <Badge variant="info">DIY Support</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* AI Repair Assistant */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowRepairAssistant(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">AI Repair Chat</h4>
                <p className="text-xs text-surface-500">Get live guidance as you repair</p>
              </div>
            </div>
          </Card>

          {/* Smart Parts List */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowPartsList(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Parts & Shopping</h4>
                <p className="text-xs text-surface-500">Checklist with store links</p>
              </div>
            </div>
          </Card>

          {/* Video Hub */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowVideoHub(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <YoutubeIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Video Tutorials</h4>
                <p className="text-xs text-surface-500">Watch repair walkthroughs</p>
              </div>
            </div>
          </Card>

          {/* Safety Guard */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowSafetyGuard(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Safety Checklist</h4>
                <p className="text-xs text-surface-500">Pre-repair safety steps</p>
              </div>
            </div>
          </Card>

          {/* Skill Assessment */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowSkillAssessment(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Skill Assessment</h4>
                <p className="text-xs text-surface-500">
                  {skillResult ? `Level: ${skillResult.level}` : 'Can you handle this repair?'}
                </p>
              </div>
            </div>
          </Card>

          {/* Repair Progress */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowCheckpoint(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Flag className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Track Progress</h4>
                <p className="text-xs text-surface-500">Save & resume your repair</p>
              </div>
            </div>
          </Card>

          {/* Cost Comparison */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowCostComparison(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Cost Comparison</h4>
                <p className="text-xs text-surface-500">DIY vs Pro vs Replace</p>
              </div>
            </div>
          </Card>

          {/* Repair vs Replace Calculator */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowRepairReplace(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Repair vs. Replace</h4>
                <p className="text-xs text-surface-500">Should you fix it or buy new?</p>
              </div>
            </div>
          </Card>

          {/* Appliance Lifespan */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => setShowLifespan(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Appliance Lifespan</h4>
                <p className="text-xs text-surface-500">Brand reliability & risk score</p>
              </div>
            </div>
          </Card>

          {/* Virtual Tech */}
          <Card padding="md" hover className="cursor-pointer" onClick={() => {
            const el = document.getElementById('virtual-tech-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold text-surface-900">Live Tech Support</h4>
                <p className="text-xs text-surface-500">Video call with a pro</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* Voice Guided Repair Modal */}
      {showVoiceGuide && (
        <VoiceGuidedRepair
          steps={result.troubleshootingSteps}
          itemDescription={result.itemDescription}
          onClose={() => setShowVoiceGuide(false)}
          onComplete={() => {
            setShowVoiceGuide(false);
            // Could trigger outcome feedback here
          }}
        />
      )}

      {/* Parts Needed */}
      {result.partsNeeded.length > 0 && (
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-surface-900">
              Parts You Might Need
            </h3>
            <Badge variant="outline">{result.partsNeeded.length} items</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.partsNeeded.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Video Tutorials */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-bold text-surface-900 flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Repair Videos
          </h3>
          {result.youtubeVideos && result.youtubeVideos.length > 0 && (
            <Badge variant="outline">{result.youtubeVideos.length} videos</Badge>
          )}
        </div>
        <Card padding="md">
          {result.youtubeVideos && result.youtubeVideos.length > 0 ? (
            <div className="space-y-2">
              {result.youtubeVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Youtube className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-surface-600 mb-4">
                Find helpful repair tutorials on YouTube
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${result.itemDescription} ${result.likelyIssues[0]?.title || ''} repair tutorial how to fix`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <Youtube className="w-4 h-4" />
                Search YouTube for Repair Videos
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </Card>
      </motion.section>

      {/* Local Professionals */}
      <LocalProfessionals
        itemType={result.itemType}
        diagnosisId={result.id}
        issueTitle={result.likelyIssues[0]?.title}
      />

      {/* Virtual Technician Connection */}
      <VirtualTechConnect
        itemType={result.itemType}
        issueTitle={result.likelyIssues[0]?.title}
      />

      {/* Save Diagnosis */}
      <motion.div variants={item}>
        <SaveDiagnosis
          diagnosisId={result.id}
          itemDescription={result.itemDescription}
          onSave={onSave}
          isSaved={isSaved}
        />
      </motion.div>

      {/* Quick Feedback */}
      <motion.div variants={item}>
        <Card padding="sm" className="border-surface-200">
          <QuickFeedback diagnosisId={result.id} />
        </Card>
      </motion.div>

      {/* Weekly Tips Signup */}
      <motion.div variants={item}>
        <WeeklyTipSignup />
      </motion.div>

      {/* Rate the App CTA */}
      {!hasRated && (
        <motion.div variants={item}>
          <Card padding="md" className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900">Enjoying RepairIQ?</h4>
                  <p className="text-sm text-surface-600">Take a moment to rate your experience</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="md"
                icon={<Star className="w-4 h-4" />}
                onClick={() => setShowRateApp(true)}
                className="border-amber-300 hover:bg-amber-100"
              >
                Rate App
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Rate App Modal */}
      <RateApp
        diagnosisId={result.id}
        isOpen={showRateApp}
        onClose={() => setShowRateApp(false)}
        onSubmit={handleRatingSubmit}
      />

      {/* AI Repair Assistant */}
      <RepairAssistant
        result={result}
        isOpen={showRepairAssistant}
        onClose={() => setShowRepairAssistant(false)}
      />

      {/* Smart Parts List */}
      <SmartPartsList
        result={result}
        isOpen={showPartsList}
        onClose={() => setShowPartsList(false)}
      />

      {/* Video Hub */}
      <RepairVideoHub
        result={result}
        isOpen={showVideoHub}
        onClose={() => setShowVideoHub(false)}
      />

      {/* Skill Assessment */}
      <SkillAssessment
        isOpen={showSkillAssessment}
        onClose={() => setShowSkillAssessment(false)}
        repairDifficulty={result.likelyIssues[0]?.difficulty || 'medium'}
        onComplete={(assessment) => setSkillResult(assessment)}
      />

      {/* Repair Checkpoint */}
      <RepairCheckpoint
        result={result}
        isOpen={showCheckpoint}
        onClose={() => setShowCheckpoint(false)}
      />

      {/* Safety Guard */}
      <SafetyGuard
        result={result}
        isOpen={showSafetyGuard}
        onClose={() => setShowSafetyGuard(false)}
      />

      {/* Cost Comparison */}
      <CostComparison
        isOpen={showCostComparison}
        onClose={() => setShowCostComparison(false)}
        diagnosisId={result.id}
        itemType={result.itemType}
        issueTitle={result.likelyIssues[0]?.title || ''}
        estimatedPartsCost={result.estimatedTotalCost}
        difficulty={result.likelyIssues[0]?.difficulty}
      />

      {/* Repair vs Replace Calculator */}
      <RepairReplaceCalculator
        isOpen={showRepairReplace}
        onClose={() => setShowRepairReplace(false)}
      />

      {/* Appliance Lifespan */}
      <ApplianceLifespan
        isOpen={showLifespan}
        onClose={() => setShowLifespan(false)}
      />
    </motion.div>
  );
}

export default DiagnosisResults;
