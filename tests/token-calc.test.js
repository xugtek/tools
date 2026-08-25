import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateMonthlyCost,
  convertCurrency,
  createComparisonSnapshot,
  estimateDailyUsage,
  formatMoney,
  normalizeRate,
  resolvePriceTriples,
  seedPriceDrafts,
  sortByMonthlyCost,
  switchPriceDraft,
  toNonNegativeNumber
} from '../assets/js/token-calc-core.js';

test('calculateMonthlyCost computes daily and monthly costs', () => {
  const model = {
    input: 2.5,
    cachedInput: 1.25,
    output: 10
  };

  const result = calculateMonthlyCost(
    { input: 1, cachedInput: 0.3, output: 0.2 },
    model,
    { days: 30 }
  );

  assert.equal(result.totalInput, 1);
  assert.equal(result.normalInput, 0.7);
  assert.equal(result.cachedInput, 0.3);
  assert.equal(result.output, 0.2);
  assert.ok(Math.abs(result.inputCost - 1.75) < 1e-9);
  assert.ok(Math.abs(result.cachedCost - 0.375) < 1e-9);
  assert.ok(Math.abs(result.outputCost - 2) < 1e-9);
  assert.ok(Math.abs(result.dailyCost - 4.125) < 1e-9);
  assert.ok(Math.abs(result.monthlyCost - 123.75) < 1e-9);
});

test('calculateMonthlyCost handles empty cached input as zero', () => {
  const model = { input: 2, cachedInput: 1, output: 8 };
  const result = calculateMonthlyCost(
    { input: 1, cachedInput: '', output: '' },
    model,
    { days: 30 }
  );

  assert.equal(result.normalInput, 1);
  assert.equal(result.cachedInput, 0);
  assert.equal(result.output, 0);
  assert.ok(Math.abs(result.monthlyCost - 60) < 1e-9);
});

test('calculateMonthlyCost clamps cached input to total input', () => {
  const model = { input: 2, cachedInput: 0.5, output: 8 };
  const result = calculateMonthlyCost(
    { input: 100, cachedInput: 999, output: 0 },
    model,
    { days: 30 }
  );

  assert.equal(result.cachedInput, 100);
  assert.equal(result.normalInput, 0);
  assert.ok(Math.abs(result.dailyCost - 50) < 1e-12);
});

test('estimateDailyUsage estimates cache and output from total input', () => {
  const result = estimateDailyUsage(1, {
    cacheHitRate: 30,
    outputRatio: 20
  });

  assert.deepEqual(result, {
    input: 1,
    cachedInput: 0.3,
    output: 0.2
  });
});

test('estimateDailyUsage accepts percentage rates', () => {
  const result = estimateDailyUsage(1000, {
    cacheHitRate: 25,
    outputRatio: 10
  });

  assert.deepEqual(result, {
    input: 1000,
    cachedInput: 250,
    output: 100
  });
});

test('estimateDailyUsage defaults to AI coding estimates', () => {
  const result = estimateDailyUsage(1);
  assert.equal(result.cachedInput, 0.9);
  assert.equal(result.output, 0.05);
});

test('estimateDailyUsage treats 1% as 1%, not 100%', () => {
  const onePercent = estimateDailyUsage(1, {
    cacheHitRate: 30,
    outputRatio: 1
  });
  const fivePercent = estimateDailyUsage(1, {
    cacheHitRate: 30,
    outputRatio: 5
  });

  assert.equal(onePercent.output, 0.01);
  assert.equal(fivePercent.output, 0.05);
});

test('convertCurrency converts both directions', () => {
  assert.equal(convertCurrency(100, 'USD', 'CNY', 7.2), 720);
  assert.equal(convertCurrency(720, 'CNY', 'USD', 7.2), 100);
  assert.equal(convertCurrency(50, 'USD', 'USD', 7.2), 50);
});

test('formatMoney adds currency symbol', () => {
  assert.equal(formatMoney(1234.5, 'CNY'), '¥1,234.50');
  assert.equal(formatMoney(99.9, 'USD'), '$99.90');
});

test('normalizeRate treats input as percentage', () => {
  assert.equal(normalizeRate(30), 0.3);
  assert.equal(normalizeRate(1), 0.01);
  assert.equal(normalizeRate(0.3), 0.003);
  assert.equal(normalizeRate(1000), 10);
});

test('toNonNegativeNumber ignores invalid values', () => {
  assert.equal(toNonNegativeNumber('abc'), 0);
  assert.equal(toNonNegativeNumber(-5), 0);
  assert.equal(toNonNegativeNumber('12'), 12);
});

test('createComparisonSnapshot builds a complete snapshot', () => {
  const snapshot = createComparisonSnapshot({
    modelName: '  Kimi K3  ',
    inputM: 10,
    cachedInputM: 9,
    outputM: 0.5,
    dailyCny: 12.34,
    dailyUsd: 1.71,
    monthlyCny: 370.2,
    monthlyUsd: 51.3
  });

  assert.match(snapshot.id, /^cmp-/);
  assert.equal(snapshot.modelName, 'Kimi K3');
  assert.equal(snapshot.inputM, 10);
  assert.equal(snapshot.cachedInputM, 9);
  assert.equal(snapshot.outputM, 0.5);
  assert.equal(snapshot.dailyCny, 12.34);
  assert.equal(snapshot.dailyUsd, 1.71);
  assert.equal(snapshot.monthlyCny, 370.2);
  assert.equal(snapshot.monthlyUsd, 51.3);
  assert.equal(typeof snapshot.createdAt, 'number');
});

test('createComparisonSnapshot generates unique ids and sanitizes values', () => {
  const a = createComparisonSnapshot({ modelName: 'A', monthlyCny: 1 });
  const b = createComparisonSnapshot({ modelName: 'B', monthlyCny: 1 });
  assert.notEqual(a.id, b.id);

  const bad = createComparisonSnapshot({
    modelName: '', inputM: -3, cachedInputM: 'x', outputM: NaN, dailyCny: -5, dailyUsd: 'x', monthlyCny: NaN, monthlyUsd: undefined
  });
  assert.equal(bad.modelName, '');
  assert.equal(bad.inputM, 0);
  assert.equal(bad.cachedInputM, 0);
  assert.equal(bad.outputM, 0);
  assert.equal(bad.dailyCny, 0);
  assert.equal(bad.dailyUsd, 0);
  assert.equal(bad.monthlyCny, 0);
  assert.equal(bad.monthlyUsd, 0);
});

test('seedPriceDrafts keeps official CNY and USD prices independent', () => {
  const drafts = seedPriceDrafts({
    CNY: { input: 20, cachedInput: 2, output: 100 },
    USD: { input: 3, cachedInput: 0.3, output: 15 }
  }, 7.2);

  assert.deepEqual(drafts.CNY, { input: 20, cachedInput: 2, output: 100 });
  assert.deepEqual(drafts.USD, { input: 3, cachedInput: 0.3, output: 15 });
});

test('seedPriceDrafts converts only the missing currency', () => {
  const drafts = seedPriceDrafts({
    CNY: { input: 72, cachedInput: 7.2, output: 144 }
  }, 7.2);

  assert.deepEqual(drafts.CNY, { input: 72, cachedInput: 7.2, output: 144 });
  assert.deepEqual(drafts.USD, { input: 10, cachedInput: 1, output: 20 });
});

test('switchPriceDraft restores the original currency instead of converting back', () => {
  const seeded = seedPriceDrafts({
    CNY: { input: 20, cachedInput: 2, output: 100 },
    USD: { input: 3, cachedInput: 0.3, output: 15 }
  }, 7.2);

  const afterCnyEdit = switchPriceDraft(
    seeded,
    'CNY',
    'USD',
    { input: 50, cachedInput: 5, output: 200 },
    7.2
  );
  assert.deepEqual(afterCnyEdit.prices, { input: 3, cachedInput: 0.3, output: 15 });
  assert.deepEqual(afterCnyEdit.drafts.CNY, { input: 50, cachedInput: 5, output: 200 });

  const backToCny = switchPriceDraft(
    afterCnyEdit.drafts,
    'USD',
    'CNY',
    { input: 9, cachedInput: 0.9, output: 45 },
    7.2
  );
  assert.deepEqual(backToCny.prices, { input: 50, cachedInput: 5, output: 200 });
  assert.deepEqual(backToCny.drafts.USD, { input: 9, cachedInput: 0.9, output: 45 });
});

test('switchPriceDraft converts only when the target currency has no draft', () => {
  const switched = switchPriceDraft(
    { CNY: null, USD: null },
    'CNY',
    'USD',
    { input: 72, cachedInput: 7.2, output: 144 },
    7.2
  );

  assert.deepEqual(switched.drafts.CNY, { input: 72, cachedInput: 7.2, output: 144 });
  assert.deepEqual(switched.prices, { input: 10, cachedInput: 1, output: 20 });
});

test('sortByMonthlyCost sorts ascending and returns a new array', () => {
  const items = [
    { monthlyCny: 300 },
    { monthlyCny: 100 },
    { monthlyCny: 200 }
  ];

  const sorted = sortByMonthlyCost(items);
  assert.deepEqual(sorted.map((i) => i.monthlyCny), [100, 200, 300]);
  assert.deepEqual(items.map((i) => i.monthlyCny), [300, 100, 200]);
});

test('resolvePriceTriples keeps official dual prices independent', () => {
  const { CNY, USD } = resolvePriceTriples({
    modelPrices: {
      CNY: { input: 20, cachedInput: 2, output: 100 },
      USD: { input: 3, cachedInput: 0.3, output: 15 }
    },
    usdCnyRate: 7.2
  });
  assert.deepEqual(CNY, { input: 20, cachedInput: 2, output: 100 });
  assert.deepEqual(USD, { input: 3, cachedInput: 0.3, output: 15 });
});

test('resolvePriceTriples converts only the missing currency', () => {
  const { CNY, USD } = resolvePriceTriples({
    modelPrices: { USD: { input: 10, cachedInput: 1, output: 20 } },
    usdCnyRate: 7.2
  });
  assert.deepEqual(USD, { input: 10, cachedInput: 1, output: 20 });
  assert.deepEqual(CNY, { input: 72, cachedInput: 7.2, output: 144 });
});

test('resolvePriceTriples prefers edited drafts over official prices', () => {
  const { CNY, USD } = resolvePriceTriples({
    priceDrafts: { CNY: { input: 50, cachedInput: 5, output: 200 } },
    modelPrices: {
      CNY: { input: 20, cachedInput: 2, output: 100 },
      USD: { input: 3, cachedInput: 0.3, output: 15 }
    },
    usdCnyRate: 7.2
  });
  assert.deepEqual(CNY, { input: 50, cachedInput: 5, output: 200 });
  assert.deepEqual(USD, { input: 3, cachedInput: 0.3, output: 15 });
});

test('resolvePriceTriples defaults to zero when nothing is available', () => {
  const { CNY, USD } = resolvePriceTriples({ modelPrices: {}, usdCnyRate: 7.2 });
  assert.deepEqual(CNY, { input: 0, cachedInput: 0, output: 0 });
  assert.deepEqual(USD, { input: 0, cachedInput: 0, output: 0 });
});
