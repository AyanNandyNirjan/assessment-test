import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

async function loadReportModule() {
  const target = resolve('lib/report.js');
  assert.equal(existsSync(target), true, 'lib/report.js should exist');
  return import(pathToFileURL(target).href);
}

const sample = [
  {
    user_id: 1,
    name: 'Alice',
    total_spent: 210.5,
    order_count: 2,
    average_order_value: 105.25,
    status: 'VIP',
  },
  {
    user_id: 4,
    name: 'Diana',
    total_spent: 100,
    order_count: 3,
    average_order_value: 33.33,
    status: 'Standard',
  },
];

test('normalizeReport returns only valid report rows', async () => {
  const { normalizeReport } = await loadReportModule();
  const input = {
    data: [
      sample[0],
      null,
      { user_id: 'bad', name: 'Invalid' },
      { user_id: 5, name: '   ', total_spent: 50, order_count: 1, average_order_value: 50, status: 'Standard' },
      { user_id: 6, name: 'Zero Orders', total_spent: 0, order_count: 0, average_order_value: 0, status: 'Standard' },
      { user_id: 7, name: 'Invalid Status', total_spent: 100, order_count: 1, average_order_value: 100, status: 'Unknown' },
      sample[1],
    ],
  };

  assert.deepEqual(normalizeReport(input), sample);
  assert.deepEqual(normalizeReport({ data: null }), []);
  assert.deepEqual(normalizeReport(null), []);
  assert.deepEqual(normalizeReport({}), []);
  assert.deepEqual(normalizeReport({ data: 'not an array' }), []);
});

test('getReportMetrics derives active customers, revenue, overall AOV and VIP count', async () => {
  const { getReportMetrics } = await loadReportModule();
  assert.deepEqual(getReportMetrics(sample), {
    activeCustomers: 2,
    totalRevenue: 310.5,
    overallAov: 62.1,
    vipCustomers: 1,
  });

  assert.deepEqual(getReportMetrics([]), {
    activeCustomers: 0,
    totalRevenue: 0,
    overallAov: 0,
    vipCustomers: 0,
  });

  assert.deepEqual(getReportMetrics(null), {
    activeCustomers: 0,
    totalRevenue: 0,
    overallAov: 0,
    vipCustomers: 0,
  });
});

test('filterReport matches names and statuses case-insensitively', async () => {
  const { filterReport } = await loadReportModule();
  assert.deepEqual(filterReport(sample, 'ali'), [sample[0]]);
  assert.deepEqual(filterReport(sample, 'standard'), [sample[1]]);
  assert.deepEqual(filterReport(sample, '  '), sample);
  assert.deepEqual(filterReport(sample, null), sample);
  assert.deepEqual(filterReport(sample, undefined), sample);
  assert.deepEqual(filterReport(sample, 'non-existent-query'), []);
});

test('formatCurrency formats USD values consistently', async () => {
  const { formatCurrency } = await loadReportModule();
  assert.equal(formatCurrency(105.25), '$105.25');
  assert.equal(formatCurrency(0), '$0.00');
  assert.equal(formatCurrency(null), '$0.00');
  assert.equal(formatCurrency(undefined), '$0.00');
  assert.equal(formatCurrency(-50.5), '-$50.50');
});
