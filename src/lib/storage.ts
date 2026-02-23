import { RepairSession, DiagnosisResult, RepairOutcome, AppRating } from '@/types';
import { parseJSONSafely } from './utils';

const SESSIONS_KEY = 'repairiq_sessions';
const CURRENT_SESSION_KEY = 'repairiq_current_session';
const SAVED_REPAIRS_KEY = 'repairiq_saved_repairs';
const OUTCOMES_KEY = 'repairiq_outcomes';
const RATINGS_KEY = 'repairiq_ratings';
const HAS_RATED_KEY = 'repairiq_has_rated';

export function getSessions(): RepairSession[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SESSIONS_KEY);
  return parseJSONSafely<RepairSession[]>(data || '[]', []);
}

export function getSession(id: string): RepairSession | null {
  const sessions = getSessions();
  return sessions.find(s => s.id === id) || null;
}

export function saveSession(session: RepairSession): void {
  if (typeof window === 'undefined') return;
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return;
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_SESSION_KEY, id);
}

export function clearCurrentSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export function getSavedRepairs(): DiagnosisResult[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SAVED_REPAIRS_KEY);
  return parseJSONSafely<DiagnosisResult[]>(data || '[]', []);
}

export function saveRepair(repair: DiagnosisResult): void {
  if (typeof window === 'undefined') return;
  const repairs = getSavedRepairs();
  const existingIndex = repairs.findIndex(r => r.id === repair.id);
  
  if (existingIndex >= 0) {
    repairs[existingIndex] = repair;
  } else {
    repairs.unshift(repair);
  }
  
  localStorage.setItem(SAVED_REPAIRS_KEY, JSON.stringify(repairs));
}

export function deleteSavedRepair(id: string): void {
  if (typeof window === 'undefined') return;
  const repairs = getSavedRepairs().filter(r => r.id !== id);
  localStorage.setItem(SAVED_REPAIRS_KEY, JSON.stringify(repairs));
}

export function isRepairSaved(id: string): boolean {
  return getSavedRepairs().some(r => r.id === id);
}

// Outcome tracking
export function getOutcomes(): Record<string, RepairOutcome> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(OUTCOMES_KEY);
  return parseJSONSafely<Record<string, RepairOutcome>>(data || '{}', {});
}

export function getOutcome(diagnosisId: string): RepairOutcome | null {
  const outcomes = getOutcomes();
  return outcomes[diagnosisId] || null;
}

export function saveOutcome(outcome: RepairOutcome): void {
  if (typeof window === 'undefined') return;
  const outcomes = getOutcomes();
  outcomes[outcome.diagnosisId] = outcome;
  localStorage.setItem(OUTCOMES_KEY, JSON.stringify(outcomes));

  // Also update the saved repair if it exists
  const repairs = getSavedRepairs();
  const repairIndex = repairs.findIndex(r => r.id === outcome.diagnosisId);
  if (repairIndex >= 0) {
    repairs[repairIndex].outcome = outcome;
    localStorage.setItem(SAVED_REPAIRS_KEY, JSON.stringify(repairs));
  }
}

export function deleteOutcome(diagnosisId: string): void {
  if (typeof window === 'undefined') return;
  const outcomes = getOutcomes();
  delete outcomes[diagnosisId];
  localStorage.setItem(OUTCOMES_KEY, JSON.stringify(outcomes));
}

export function getOutcomeStats(): {
  totalReported: number;
  successRate: number;
  averageDifficulty: number;
  wouldRecommendRate: number;
} {
  const outcomes = Object.values(getOutcomes());
  if (outcomes.length === 0) {
    return {
      totalReported: 0,
      successRate: 0,
      averageDifficulty: 0,
      wouldRecommendRate: 0,
    };
  }

  const successful = outcomes.filter(o => o.wasSuccessful).length;
  const wouldRecommend = outcomes.filter(o => o.wouldRecommend).length;
  const avgDifficulty = outcomes.reduce((sum, o) => sum + o.difficultyRating, 0) / outcomes.length;

  return {
    totalReported: outcomes.length,
    successRate: Math.round((successful / outcomes.length) * 100),
    averageDifficulty: Math.round(avgDifficulty * 10) / 10,
    wouldRecommendRate: Math.round((wouldRecommend / outcomes.length) * 100),
  };
}

// App rating functions
export function getAppRatings(): AppRating[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RATINGS_KEY);
  return parseJSONSafely<AppRating[]>(data || '[]', []);
}

export function saveAppRating(rating: AppRating): void {
  if (typeof window === 'undefined') return;
  const ratings = getAppRatings();
  ratings.unshift(rating);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  // Mark that user has rated for this diagnosis
  markAsRated(rating.diagnosisId);
}

export function hasRatedDiagnosis(diagnosisId: string): boolean {
  if (typeof window === 'undefined') return false;
  const rated = localStorage.getItem(HAS_RATED_KEY);
  const ratedIds = parseJSONSafely<string[]>(rated || '[]', []);
  return ratedIds.includes(diagnosisId);
}

export function markAsRated(diagnosisId: string): void {
  if (typeof window === 'undefined') return;
  const rated = localStorage.getItem(HAS_RATED_KEY);
  const ratedIds = parseJSONSafely<string[]>(rated || '[]', []);
  if (!ratedIds.includes(diagnosisId)) {
    ratedIds.push(diagnosisId);
    localStorage.setItem(HAS_RATED_KEY, JSON.stringify(ratedIds));
  }
}

export function getAverageAppRating(): number {
  const ratings = getAppRatings();
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
