import StatusBadge from './StatusBadge';
import { formatCurrency } from '../lib/report';

export default function ReportTable({ rows, query = '', onClearQuery }) {
  if (!rows.length) {
    return (
      <div className="empty-state" role="status" aria-live="polite">
        <div className="empty-state__mark" aria-hidden="true">0</div>
        <h3>{query ? 'No matching customers' : 'No active customer records'}</h3>
        <p>
          {query
            ? `No customers match "${query}". Try searching by a different name or status.`
            : 'No customer orders were found in the current report.'}
        </p>
        {query && onClearQuery ? (
          <div style={{ marginTop: '16px' }}>
            <button className="button button--light" type="button" onClick={onClearQuery}>
              Clear search filter
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table className="report-table" aria-label="Customer performance report">
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">Total spent</th>
              <th scope="col">Orders</th>
              <th scope="col">Avg. order value</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user_id}>
                <td>
                  <div className="customer-cell">
                    <span className="avatar" aria-hidden="true">
                      {row.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <strong>{row.name}</strong>
                      <span>Customer #{String(row.user_id).padStart(3, '0')}</span>
                    </div>
                  </div>
                </td>
                <td className="value-cell">{formatCurrency(row.total_spent)}</td>
                <td>{row.order_count}</td>
                <td className="value-cell">{formatCurrency(row.average_order_value)}</td>
                <td><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-cards">
        {rows.map((row) => (
          <article className="customer-card" key={row.user_id}>
            <div className="customer-card__header">
              <div className="customer-cell">
                <span className="avatar" aria-hidden="true">
                  {row.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{row.name}</strong>
                  <span>Customer #{String(row.user_id).padStart(3, '0')}</span>
                </div>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <dl className="customer-card__stats">
              <div>
                <dt>Total spent</dt>
                <dd>{formatCurrency(row.total_spent)}</dd>
              </div>
              <div>
                <dt>Orders</dt>
                <dd>{row.order_count}</dd>
              </div>
              <div>
                <dt>Avg. order value</dt>
                <dd>{formatCurrency(row.average_order_value)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
