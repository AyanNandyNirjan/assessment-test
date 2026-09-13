import Dashboard from '../components/Dashboard';
import { normalizeReport } from '../lib/report';

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

async function fetchInitialData() {
  const backendUrl = (process.env.BACKEND_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${backendUrl}/api/report`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const payload = await response.json();
    return normalizeReport(payload);
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const initialRows = await fetchInitialData();
  return <Dashboard initialRows={initialRows} />;
}
