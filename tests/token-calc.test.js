import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateMonthlyCost,
  convertCurrency,
  estimateDailyUsage,
  formatMoney,
  normalizeRate,
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

test('estimateDailyUsage accepts fractional rates', () => {
  const result = estimateDailyUsage(1000, {
    cacheHitRate: 0.25,
    outputRatio: 0.1
  });

  assert.deepEqual(result, {
    input: 1000,
    cachedInput: 250,
    output: 100
  });
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

test('normalizeRate treats >1 as percentage', () => {
  assert.equal(normalizeRate(30), 0.3);
  assert.equal(normalizeRate(0.3), 0.3);
});

test('toNonNegativeNumber ignores invalid values', () => {
  assert.equal(toNonNegativeNumber('abc'), 0);
  assert.equal(toNonNegativeNumber(-5), 0);
  assert.equal(toNonNegativeNumber('12'), 12);
});
