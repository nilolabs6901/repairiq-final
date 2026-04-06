import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedRepairs,
  saveRepair,
  deleteSavedRepair,
  isRepairSaved,
  saveAppRating,
  getAppRatings,
  hasRatedDiagnosis,
  getAverageAppRating,
} from '@/lib/storage';
import { DiagnosisResult, AppRating } from '@/types';

function makeDiagnosis(id: string): DiagnosisResult {
  return {
    id,
    itemType: 'refrigerator',
    itemDescription: 'Test fridge',
    summary: 'Not cooling',
    likelyIssues: [],
    troubleshootingSteps: [],
    partsNeeded: [],
    estimatedTotalTime: '1 hour',
    estimatedTotalCost: '$50',
    shouldCallProfessional: false,
    overallConfidence: 80,
    confidenceFactors: { informationQuality: 80, symptomClarity: 80, patternMatch: 80 },
    createdAt: new Date(),
  };
}

describe('Saved Repairs', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    expect(getSavedRepairs()).toEqual([]);
  });

  it('saves and retrieves a repair', () => {
    const repair = makeDiagnosis('test-1');
    saveRepair(repair);

    const saved = getSavedRepairs();
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('test-1');
  });

  it('updates an existing repair', () => {
    saveRepair(makeDiagnosis('test-1'));
    const updated = makeDiagnosis('test-1');
    updated.summary = 'Updated summary';
    saveRepair(updated);

    const saved = getSavedRepairs();
    expect(saved).toHaveLength(1);
    expect(saved[0].summary).toBe('Updated summary');
  });

  it('deletes a repair', () => {
    saveRepair(makeDiagnosis('test-1'));
    saveRepair(makeDiagnosis('test-2'));
    deleteSavedRepair('test-1');

    expect(getSavedRepairs()).toHaveLength(1);
    expect(isRepairSaved('test-1')).toBe(false);
    expect(isRepairSaved('test-2')).toBe(true);
  });
});

describe('App Ratings', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    expect(getAppRatings()).toEqual([]);
    expect(getAverageAppRating()).toBe(0);
  });

  it('saves a rating and marks as rated', () => {
    const rating: AppRating = {
      id: 'r1',
      diagnosisId: 'diag-1',
      createdAt: new Date(),
      rating: 4,
      wasHelpful: true,
      wouldRecommend: true,
      feedback: 'Great!',
    };
    saveAppRating(rating);

    expect(getAppRatings()).toHaveLength(1);
    expect(hasRatedDiagnosis('diag-1')).toBe(true);
    expect(hasRatedDiagnosis('diag-999')).toBe(false);
  });

  it('calculates average rating', () => {
    const makeRating = (id: string, score: 1 | 2 | 3 | 4 | 5): AppRating => ({
      id,
      diagnosisId: id,
      createdAt: new Date(),
      rating: score,
      wasHelpful: true,
      wouldRecommend: true,
    });

    saveAppRating(makeRating('r1', 5));
    saveAppRating(makeRating('r2', 3));
    expect(getAverageAppRating()).toBe(4);
  });
});
