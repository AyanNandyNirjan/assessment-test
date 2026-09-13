# Aggregator Frontend

Next.js frontend for the Full-Stack Developer Assessment. It consumes the FastAPI `/api/report` endpoint, calculates report summary metrics, and renders a responsive customer report dashboard.

## Stack

- Next.js App Router
- React
- Hugeicons Free
- Plain CSS
- Node built-in test runner

## 1. Start the FastAPI backend

From your backend folder:

```powershell
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

The backend should be available at `http://127.0.0.1:8000`.

## 2. Configure the frontend

Copy the example environment file:

```powershell
Copy-Item .env.local.example .env.local
```

Default value:

```env
BACKEND_API_URL=http://127.0.0.1:8000
```

## 3. Install and run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tests

```powershell
npm test
```

## Production build

```powershell
npm run build
npm start
```

## Integration note

The frontend uses `BACKEND_API_URL` from `.env.local` to connect to the FastAPI backend service. In addition to proxy routes in Next.js (`/api/customers` and `/api/report`), the frontend provides an interactive tab navigation allowing users to toggle between **All customers** and **Active customers**.

