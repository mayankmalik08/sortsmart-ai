import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyScanToChallenges,
  calculateRewardTier,
  canClaimScanPoints,
  computeDashboardMetrics,
  computePointsForScan,
  normalizeCategory,
  validateWasteClassification,
} from './wasteLogic.ts';
import type { EcoChallenge, WasteScanRecord } from '../types/sortsmart.ts';

test('normalizeCategory maps Gemini variants into canonical categories', () => {
  assert.equal(normalizeCategory('Wet waste'), 'Wet waste');
  assert.equal(normalizeCategory('Dry / Recyclable waste'), 'Recyclable waste');
  assert.equal(normalizeCategory('e-waste'), 'E-waste');
  assert.equal(normalizeCategory('Hazardous'), 'Hazardous waste');
  assert.equal(normalizeCategory('something weird'), 'Unclear');
});

test('validateWasteClassification accepts valid structured AI output', () => {
  const result = validateWasteClassification({
    item: 'Clear PET Water Bottle',
    category: 'Recyclable waste',
    reasoning: 'Made of #1 PET plastic which is widely recycled after emptying.',
    recommendedBin: 'Dry recyclable waste bin',
    instructions: 'Empty remaining water, crush lightly, and drop in the blue bin.',
    specialHandlingRequired: false,
    specialHandlingNote: null,
    ecoTip: 'Switch to a steel flask on campus to cut single-use plastic.',
    confidence: 92,
    isUnclear: false,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.category, 'Recyclable waste');
    assert.equal(result.data.confidence, 92);
    assert.equal(result.data.isUnclear, false);
  }
});

test('validateWasteClassification handles unclear images without faking confidence', () => {
  const result = validateWasteClassification({
    item: '',
    category: 'Unclear',
    isUnclear: true,
    confidence: 88,
  });

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.isUnclear, true);
    assert.equal(result.data.category, 'Unclear');
    assert.equal(result.data.confidence, null);
  }
});

test('validateWasteClassification rejects malformed non-object responses', () => {
  const result = validateWasteClassification('invalid');
  assert.equal(result.valid, false);
});

test('computePointsForScan and canClaimScanPoints enforce fair single-claim scoring', () => {
  assert.equal(computePointsForScan('E-waste', false), 30);
  assert.equal(computePointsForScan('Recyclable waste', false), 20);
  assert.equal(computePointsForScan('Wet waste', false), 15);
  assert.equal(computePointsForScan('E-waste', true), 15);

  assert.equal(canClaimScanPoints('hash-abc', []), true);
  assert.equal(canClaimScanPoints('hash-abc', ['hash-abc']), false);
  assert.equal(canClaimScanPoints('', []), false);
});

test('calculateRewardTier computes tier thresholds and progress accurately', () => {
  const beginner = calculateRewardTier(120);
  assert.equal(beginner.currentTier, 'Green Beginner');
  assert.equal(beginner.nextTier, 'Eco Explorer');
  assert.equal(beginner.pointsToNext, 80);

  const explorer = calculateRewardTier(350);
  assert.equal(explorer.currentTier, 'Eco Explorer');
  assert.equal(explorer.nextTier, 'Sustainability Champion');
  assert.equal(explorer.progressPct, 50);

  const guardian = calculateRewardTier(1400);
  assert.equal(guardian.currentTier, 'Planet Guardian');
  assert.equal(guardian.nextTier, null);
  assert.equal(guardian.progressPct, 100);
});

test('applyScanToChallenges increments matching challenges and marks completion', () => {
  const initial: EcoChallenge[] = [
    {
      id: 'c1',
      title: 'Sort 2 Recyclables',
      description: 'Scan 2 recyclable items today.',
      targetCount: 2,
      currentCount: 1,
      rewardPoints: 25,
      targetCategory: 'Recyclable waste',
      completed: false,
      claimed: false,
    },
    {
      id: 'c2',
      title: 'Compost 1 Organic Item',
      description: 'Log 1 wet waste item.',
      targetCount: 1,
      currentCount: 0,
      rewardPoints: 20,
      targetCategory: 'Wet waste',
      completed: false,
      claimed: false,
    },
  ];

  const updated = applyScanToChallenges(initial, 'Recyclable waste');
  assert.equal(updated[0].currentCount, 2);
  assert.equal(updated[0].completed, true);
  assert.equal(updated[1].currentCount, 0);
  assert.equal(updated[1].completed, false);
});

test('computeDashboardMetrics aggregates scans, category counts, and points', () => {
  const scans: WasteScanRecord[] = [
    {
      id: '1',
      scanHash: 'h1',
      item: 'Plastic Bottle',
      category: 'Recyclable waste',
      recommendedBin: 'Blue Bin',
      instructions: 'Empty bottle',
      reasoning: 'PET plastic',
      ecoTip: 'Reuse',
      specialHandlingRequired: false,
      confidence: 91,
      pointsAwarded: 20,
      confirmed: true,
      manualOverride: false,
      sourceMode: 'live-ai',
      timestamp: '2026-11-15T09:00:00Z',
    },
    {
      id: '2',
      scanHash: 'h2',
      item: 'Banana Peel',
      category: 'Wet waste',
      recommendedBin: 'Green Bin',
      instructions: 'Compost',
      reasoning: 'Organic',
      ecoTip: 'Compost locally',
      specialHandlingRequired: false,
      confidence: 95,
      pointsAwarded: 15,
      confirmed: true,
      manualOverride: false,
      sourceMode: 'demo-sample',
      timestamp: '2026-11-15T10:00:00Z',
    },
  ];

  const metrics = computeDashboardMetrics(scans, 25);
  assert.equal(metrics.totalScans, 2);
  assert.equal(metrics.totalPoints, 60);
  assert.equal(metrics.recyclingRatePct, 50);
  assert.equal(metrics.categoryCounts['Recyclable waste'], 1);
  assert.equal(metrics.categoryCounts['Wet waste'], 1);
});
