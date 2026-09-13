# The Aggregator — FastAPI Backend

Backend solution for the assessment. The supplied mock data functions are left unchanged; only the `/api/report` endpoint has been refactored.

## What was fixed

- Runs independent order fetches concurrently with `asyncio.gather`.
- Prevents `None`/failed upstream order results from crashing the report.
- Filters out users with zero orders.
- Calculates `total_spent`, `order_count`, and `average_order_value`.
- Adds `status`: `VIP` when AOV is greater than 100, otherwise `Standard`.

## Run locally

```bash
python -m venv .venv
```

Activate the virtual environment, then:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open:

- API: `http://127.0.0.1:8000/api/report`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Automated Tests

Run tests with Python's built-in test runner (no extra dependencies required):

```bash
python -m unittest discover tests -v
```

Or using `pytest`:

```bash
pytest tests -v
```

## Expected report data

```json
{
  "data": [
    {
      "user_id": 1,
      "name": "Alice",
      "total_spent": 210.5,
      "order_count": 2,
      "average_order_value": 105.25,
      "status": "VIP"
    },
    {
      "user_id": 4,
      "name": "Diana",
      "total_spent": 100.0,
      "order_count": 3,
      "average_order_value": 33.33,
      "status": "Standard"
    }
  ]
}
```
