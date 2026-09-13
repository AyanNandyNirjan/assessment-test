import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | Aggregator Report',
  description: 'The requested page does not exist.',
};

export default function NotFound() {
  return (
    <main className="dashboard-shell">
      <div className="empty-state" style={{ marginTop: '80px' }}>
        <div className="empty-state__mark" aria-hidden="true">404</div>
        <h2>Page not found</h2>
        <p>The requested page does not exist or has been moved.</p>
        <div style={{ marginTop: '24px' }}>
          <Link href="/" className="button button--dark" style={{ textDecoration: 'none' }}>
            Return to report
          </Link>
        </div>
      </div>
    </main>
  );
}
