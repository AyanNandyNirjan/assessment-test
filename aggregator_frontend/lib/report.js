const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function normalizeReport(payload, options = {}) {
  const { includeAll = false } = options;
  if (!payload || !Array.isArray(payload.data)) return [];

  return payload.data.filter((row) => {
    const validStatus = includeAll
      ? row?.status === 'VIP' || row?.status === 'Standard' || row?.status === 'Inactive'
      : row?.status === 'VIP' || row?.status === 'Standard';

    const validOrderCount = includeAll
      ? Number.isInteger(row?.order_count) && row.order_count >= 0
      : Number.isInteger(row?.order_count) && row.order_count > 0;

    return Boolean(
      row &&
        Number.isInteger(row.user_id) &&
        typeof row.name === 'string' &&
        row.name.trim() &&
        isFiniteNumber(row.total_spent) &&
        validOrderCount &&
        isFiniteNumber(row.average_order_value) &&
        validStatus,
    );
  });
}

export function normalizeCustomers(payload) {
  return normalizeReport(payload, { includeAll: true });
}

export function getReportMetrics(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const activeRows = safeRows.filter((row) => (row.order_count || 0) > 0 && row.status !== 'Inactive');
  const totalRevenue = activeRows.reduce((sum, row) => sum + (row.total_spent || 0), 0);
  const totalOrders = activeRows.reduce((sum, row) => sum + (row.order_count || 0), 0);

  return {
    activeCustomers: activeRows.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    overallAov: totalOrders ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
    vipCustomers: activeRows.filter((row) => row.status === 'VIP').length,
  };
}

export function filterReport(rows, query, tab = 'all') {
  const safeRows = Array.isArray(rows) ? rows : [];
  const tabFiltered =
    tab === 'active'
      ? safeRows.filter((row) => (row.order_count || 0) > 0 && row.status !== 'Inactive')
      : safeRows;

  const normalizedQuery = String(query ?? '').trim().toLowerCase();
  if (!normalizedQuery) return tabFiltered;

  return tabFiltered.filter((row) => {
    return row.name.toLowerCase().includes(normalizedQuery) || row.status.toLowerCase().includes(normalizedQuery);
  });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}
