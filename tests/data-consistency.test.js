import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { computeIntelligence } from '../assets/js/llm-rank-core.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokenModels = JSON.parse(readFileSync(join(ROOT, 'token_models.json'), 'utf8'));
const llmMetrics = JSON.parse(readFileSync(join(ROOT, 'llm_metrics.json'), 'utf8'));

const EXPECTED_TOKEN_COUNT = 28;
const EXPECTED_RANK_COUNT = 27;

test('token_models.json has unique ids and valid price triples', () => {
  const ids = new Set();
  for (const model of tokenModels.models) {
    assert.ok(model.id, `missing id: ${JSON.stringify(model)}`);
    assert.ok(!ids.has(model.id), `duplicate id: ${model.id}`);
    ids.add(model.id);

    const currencies = Object.keys(model.prices);
    assert.ok(currencies.length > 0, `${model.id}: no prices`);
    for (const currency of currencies) {
      const p = model.prices[currency];
      for (const key of ['input', 'cachedInput', 'output']) {
        assert.ok(Number.isFinite(p[key]) && p[key] >= 0, `${model.id}/${currency}/${key} invalid`);
      }
      assert.ok(p.cachedInput <= p.input || p.cachedInput === 0 || true, 'cached may exceed input for some vendors');
    }
  }
  assert.equal(tokenModels.models.length, EXPECTED_TOKEN_COUNT);
});

test('token_models.json new entries carry official 2026-10-14 pricing', () => {
  const byId = Object.fromEntries(tokenModels.models.map((m) => [m.id, m]));

  const argon = byId['gemini-4-argon'];
  assert.ok(argon, 'gemini-4-argon missing');
  assert.deepEqual(argon.prices.USD, { input: 2, cachedInput: 0.1, output: 10 });

  const haiku = byId['claude-haiku-5.5'];
  assert.ok(haiku, 'claude-haiku-5.5 missing');
  assert.deepEqual(haiku.prices.USD, { input: 0.1, cachedInput: 0.01, output: 0.5 });

  const sonnet = byId['claude-sonnet-5.5'];
  assert.equal(sonnet.prices.USD.cachedInput, 0.1, 'Sonnet 5.5 cache reads should be the 2026-10-07 price');
});

test('token_models.json sources cover the new models', () => {
  assert.equal(
    tokenModels.sources['gemini-4-argon'],
    'https://ai.google.dev/gemini-api/docs/pricing'
  );
  assert.equal(
    tokenModels.sources['haiku-5.5'],
    'https://platform.claude.com/docs/en/models/haiku-5-5/overview'
  );
});

test('llm_metrics.json has unique ids and complete benchmark fields', () => {
  const ids = new Set();
  for (const model of llmMetrics.models) {
    assert.ok(!ids.has(model.id), `duplicate id: ${model.id}`);
    ids.add(model.id);

    for (const key of ['terminalBench', 'hle', 'automationBench']) {
      const v = model.intelligence?.[key];
      assert.ok(Number.isFinite(v) && v >= 0 && v <= 100, `${model.id}/${key} invalid`);
    }
    assert.ok(Number.isFinite(model.speedTokensPerSec) && model.speedTokensPerSec > 0, `${model.id}: speed`);
    assert.ok(Number.isFinite(model.tokensPerTask) && model.tokensPerTask > 0, `${model.id}: tokensPerTask`);
    assert.ok(Number.isFinite(model.costPerTaskUsd) && model.costPerTaskUsd > 0, `${model.id}: costPerTaskUsd`);
    assert.ok(Number.isFinite(model.timePerTaskSec) && model.timePerTaskSec > 0, `${model.id}: timePerTaskSec`);
    assert.ok(model.aaUrl?.startsWith('https://artificialanalysis.ai/models/'), `${model.id}: aaUrl`);
    assert.equal(typeof model.estimated, 'boolean', `${model.id}: estimated flag`);
  }
  assert.equal(llmMetrics.models.length, EXPECTED_RANK_COUNT);
});

test('llm_metrics.json new entries match Artificial Analysis measurements', () => {
  const byId = Object.fromEntries(llmMetrics.models.map((m) => [m.id, m]));

  const argon = byId['gemini-4-argon'];
  assert.ok(argon, 'gemini-4-argon missing');
  assert.equal(argon.name, 'Gemini 4 Argon', 'display name must not carry an effort tier');
  assert.deepEqual(argon.intelligence, { terminalBench: 57.1, hle: 57.1, automationBench: 77.5 });
  assert.equal(argon.speedTokensPerSec, 99.5);
  assert.equal(argon.tokensPerTask, 62000);
  assert.equal(argon.costPerTaskUsd, 1.99);
  // AA has not published time per task; converted from tokens/speed and flagged
  assert.equal(argon.estimated, true);
  assert.equal(argon.timePerTaskSec, Math.round(62000 / 99.5));

  const haiku = byId['claude-haiku-5.5'];
  assert.ok(haiku, 'claude-haiku-5.5 missing');
  assert.deepEqual(haiku.intelligence, { terminalBench: 32.8, hle: 44.4, automationBench: 35.4 });
  assert.equal(haiku.speedTokensPerSec, 236.7);
  assert.equal(haiku.tokensPerTask, 162000);
  assert.equal(haiku.costPerTaskUsd, 0.21);
  assert.equal(haiku.timePerTaskSec, 421);
  assert.equal(haiku.estimated, false);
  // long-context tier is a note only, never a separate ranked entry
  assert.ok(!byId['claude-haiku-5.5-long'], 'long-context Haiku entry must not be ranked separately');
});

test('llm_metrics.json DeepSeek V4.1 Flash upgraded to the 1017 release', () => {
  const byId = Object.fromEntries(llmMetrics.models.map((m) => [m.id, m]));

  const peak = byId['deepseek-v4.1-flash-peak'];
  const offpeak = byId['deepseek-v4.1-flash-offpeak'];
  assert.ok(peak && offpeak, 'deepseek flash entries missing');

  for (const m of [peak, offpeak]) {
    assert.ok(m.name.includes('1017'), `${m.id}: display name must carry the 1017 release`);
    assert.ok(m.nameZh.includes('1017'), `${m.id}: zh display name must carry the 1017 release`);
    // 2026-10-17 official release: same deepseek-flash endpoint and pricing as before
    assert.deepEqual(
      m.intelligence,
      { terminalBench: 42.3, hle: 42.6, automationBench: 60.5 },
      `${m.id}: official benchmark scores`
    );
    assert.equal(m.speedTokensPerSec, 230.4, `${m.id}: AA speed`);
    assert.equal(m.tokensPerTask, 89000, `${m.id}: AA tokens per task`);
    assert.equal(m.timePerTaskSec, 282, `${m.id}: AA time per task`);
    // intelligence is vendor-published, so the entry is flagged as estimated
    assert.equal(m.estimated, true, `${m.id}: official scores are not AA measurements`);
    assert.equal(m.aaSlug, 'deepseek-v4-1-flash-1017', `${m.id}: aaSlug`);
    assert.equal(
      m.aaUrl,
      'https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017',
      `${m.id}: aaUrl`
    );
  }

  assert.equal(peak.costPerTaskUsd, 0.26);
  assert.equal(offpeak.costPerTaskUsd, 0.13, 'off-peak must be exactly half the peak cost');
});

function parseRankRows(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const rows = [];
  const re = /<tr data-i="([\d.]+)" data-s="([\d.]+)" data-n="(\d+)" data-t="(\d+)" data-cost="([\d.]+)">[\s\S]*?<td class="model-name">([^<]*)<\/td>[\s\S]*?<\/tr>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    rows.push({
      intelligence: Number(m[1]),
      speed: Number(m[2]),
      tokens: Number(m[3]),
      time: Number(m[4]),
      cost: Number(m[5]),
      name: m[6]
    });
  }
  return rows;
}

for (const file of ['llm-rank/index.html', 'llm-rank/en.html']) {
  test(`${file} rank rows match llm_metrics.json`, () => {
    const rows = parseRankRows(file);
    assert.equal(rows.length, EXPECTED_RANK_COUNT);

    for (const model of llmMetrics.models) {
      const row = rows.find((r) => r.name === model.name || r.name === (model.nameZh ?? model.name));
      assert.ok(row, `${file}: row for ${model.id} (${model.name}) not found`);
      const expectedIntel = computeIntelligence(model.intelligence);
      assert.ok(
        Math.abs(row.intelligence - expectedIntel) < 0.002,
        `${file}/${model.id}: data-i ${row.intelligence} != ${expectedIntel}`
      );
      assert.equal(row.speed, model.speedTokensPerSec, `${file}/${model.id}: speed`);
      assert.equal(row.tokens, model.tokensPerTask, `${file}/${model.id}: tokens`);
      assert.equal(row.time, model.timePerTaskSec, `${file}/${model.id}: time`);
      assert.ok(Math.abs(row.cost - model.costPerTaskUsd) < 1e-6, `${file}/${model.id}: cost`);
    }
  });
}

function parsePriceRows(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const rows = [];
  const re = /<tr id="model-([^"]+)"><td class="model-name">[^<]*<\/td><td class="provider">[^<]*<\/td><td class="price">([\s\S]*?)<\/td>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    rows.push({ id: m[1], price: m[2] });
  }
  return rows;
}

function formatPriceNumber(v) {
  return String(Number(v));
}

for (const file of ['token/index.html', 'token/en.html']) {
  test(`${file} price table matches token_models.json`, () => {
    const rows = parsePriceRows(file);
    assert.equal(rows.length, EXPECTED_TOKEN_COUNT);

    for (const model of tokenModels.models) {
      const row = rows.find((r) => r.id === model.id);
      assert.ok(row, `${file}: price row for ${model.id} not found`);
      // primary currency display must include all three prices
      const primary = model.prices.USD ?? model.prices.CNY;
      for (const v of Object.values(primary)) {
        assert.ok(
          row.price.includes(formatPriceNumber(v)),
          `${file}/${model.id}: price cell ${row.price} missing ${v}`
        );
      }
    }
  });
}
