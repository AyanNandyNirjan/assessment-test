const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function normalizeReport(payload) {
  if (!payload || !Array.isArray(payload.data)) return [];

  return payload.data.filter((row) => {
    return Boolean(
      row &&
        Number.isInteger(row.user_id) &&
        typeof row.name === 'string' &&
        row.name.trim() &&
        isFiniteNumber(row.total_spent) &&
        Number.isInteger(row.order_count) &&
        row.order_count > 0 &&
        isFiniteNumber(row.average_order_value) &&
        (row.status === 'VIP' || row.status === 'Standard'),
    );
  });
}

export function getReportMetrics(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const totalRevenue = safeRows.reduce((sum, row) => sum + row.total_spent, 0);
  const totalOrders = safeRows.reduce((sum, row) => sum + row.order_count, 0);

  return {
    activeCustomers: safeRows.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    overallAov: totalOrders ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
    vipCustomers: safeRows.filter((row) => row.status === 'VIP').length,
  };
}

export function filterReport(rows, query) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const normalizedQuery = String(query ?? '').trim().toLowerCase();
  if (!normalizedQuery) return safeRows;

  return safeRows.filter((row) => {
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
