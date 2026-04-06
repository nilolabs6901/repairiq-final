import { describe, it, expect } from 'vitest';
import { cn, generateId, getDifficultyLabel } from '@/lib/utils';

describe('cn (className merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves Tailwind conflicts', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('getDifficultyLabel', () => {
  it('returns correct labels', () => {
    expect(getDifficultyLabel('easy')).toBe('Easy DIY');
    expect(getDifficultyLabel('medium')).toBe('Medium DIY');
    expect(getDifficultyLabel('hard')).toBe('Advanced DIY');
    expect(getDifficultyLabel('professional')).toBe('Call a Pro');
  });
});
