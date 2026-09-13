'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ChartAverageIcon,
  CrownIcon,
  DashboardSquare02Icon,
  Money01Icon,
  RefreshIcon,
  SearchIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import MetricCard from './MetricCard';
import ReportTable from './ReportTable';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { filterReport, formatCurrency, getReportMetrics, normalizeReport } from '../lib/report';

export default function Dashboard({ initialRows = null }) {
  const [rows, setRows] = useState(() => initialRows || []);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(() => !initialRows || initialRows.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/report', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'The report request failed.');
      }

      setRows(normalizeReport(payload));
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the report.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setUpdatedAt(new Date());
    } else {
      loadReport();
    }
  }, [initialRows, loadReport]);

  const metrics = useMemo(() => getReportMetrics(rows), [rows]);
  const filteredRows = useMemo(() => filterReport(rows, query), [rows, query]);

  if (loading) {
    return (
      <main className="dashboard-shell">
        <Header />
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-shell">
        <Header />
        <ErrorState message={error} onRetry={() => loadReport()} />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <Header />

      <section className="hero-row" aria-labelledby="report-heading">
        <div>
          <p className="eyebrow">Customer intelligence</p>
          <h1 id="report-heading">Report Overview</h1>
          <p className="hero-copy">A focused view of active customers, order value, and account status.</p>
        </div>

        <div className="hero-actions">
          <div className="sync-state" role="status" aria-label="Backend connection active">
            <span className="sync-state__dot" aria-hidden="true" />
            API connected
          </div>
          <button
            className="button button--light"
            type="button"
            onClick={() => loadReport(true)}
            disabled={refreshing}
            aria-label={refreshing ? 'Refreshing report data' : 'Refresh report data'}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={17}
              strokeWidth={1.8}
              className={refreshing ? 'spin' : ''}
              aria-hidden="true"
            />
            {refreshing ? 'Refreshing' : 'Refresh data'}
          </button>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Report summary">
        <MetricCard
          label="Active customers"
          value={metrics.activeCustomers.toLocaleString()}
          detail="With orders"
          icon={UserGroupIcon}
        />
        <MetricCard
          label="Total revenue"
          value={formatCurrency(metrics.totalRevenue)}
          detail="Report total"
          icon={Money01Icon}
          emphasis
        />
        <MetricCard
          label="Overall AOV"
          value={formatCurrency(metrics.overallAov)}
          detail="Across all orders"
          icon={ChartAverageIcon}
        />
        <MetricCard
          label="VIP customers"
          value={metrics.vipCustomers.toLocaleString()}
          detail="AOV above $100"
          icon={CrownIcon}
        />
      </section>

      <section className="report-panel" aria-labelledby="customer-report-heading">
        <div className="report-panel__header">
          <div>
            <p className="eyebrow">Detailed report</p>
            <h2 id="customer-report-heading">Customer performance</h2>
            <p>{rows.length} active customer{rows.length === 1 ? '' : 's'} in the current report.</p>
          </div>

          <div className="search-box">
            <HugeiconsIcon icon={SearchIcon} size={18} strokeWidth={1.7} aria-hidden="true" />
            <label htmlFor="customer-search-input" className="sr-only">Search customers</label>
            <input
              id="customer-search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers or status"
              aria-label="Search customers or status"
            />
            {query ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                title="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            ) : null}
            {query ? (
              <span
                className="search-count"
                role="status"
                aria-live="polite"
                aria-label={`${filteredRows.length} matching customers`}
              >
                {filteredRows.length}
              </span>
            ) : null}
          </div>
        </div>

        <ReportTable
          rows={filteredRows}
          query={query}
          onClearQuery={() => setQuery('')}
        />

        <footer className="report-panel__footer">
          <span>Showing {filteredRows.length} of {rows.length}</span>
          <span>
            {updatedAt
              ? `Updated ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Waiting for data'}
          </span>
        </footer>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Aggregator report home">
        <span className="brand__mark" aria-hidden="true">
          <HugeiconsIcon icon={DashboardSquare02Icon} size={21} strokeWidth={1.8} />
        </span>
        <span>
          <strong>Aggregator</strong>
          <small>Reporting workspace</small>
        </span>
      </a>
      <div className="topbar__meta">
        <span className="topbar__label">FastAPI + Next.js</span>
        <span className="topbar__initial" aria-hidden="true">A</span>
      </div>
    </header>
  );
}
