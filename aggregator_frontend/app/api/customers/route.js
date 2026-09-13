const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

export async function GET(request) {
  const backendUrl = (process.env.BACKEND_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  try {
    let response = await fetch(`${backendUrl}/api/customers${queryString}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok && response.status === 404) {
      // Fallback to report endpoint with include_all=true if /api/customers is not available
      response = await fetch(`${backendUrl}/api/report?include_all=true`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      return Response.json(
        { error: `Backend returned ${response.status}. Make sure FastAPI is running.` },
        { status: 502 },
      );
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.data)) {
      return Response.json({ error: 'Backend returned an unexpected customer format.' }, { status: 502 });
    }

    return Response.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { error: 'Unable to reach the FastAPI backend. Start it on port 8000 and try again.' },
      { status: 502 },
    );
  }
}
