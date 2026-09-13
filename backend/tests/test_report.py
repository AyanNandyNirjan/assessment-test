import unittest
from unittest.mock import patch
import time
import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path so tests can be run from any working directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import generate_report, fetch_users, fetch_orders_for_user


class TestReportAPI(unittest.IsolatedAsyncioTestCase):
    """Automated tests for The Aggregator FastAPI /api/report service."""

    async def test_generate_report_happy_path(self):
        """Verify report calculations, order aggregation, and customer tier assignment."""
        result = await generate_report()

        self.assertIn("data", result)
        data = result["data"]

        # Only Alice (1) and Diana (4) should be returned
        user_ids = [item["user_id"] for item in data]
        self.assertEqual(user_ids, [1, 4])

        # Alice: orders [50.00, 160.50] -> total=210.50, count=2, AOV=105.25 -> VIP
        alice = next(item for item in data if item["user_id"] == 1)
        self.assertEqual(alice["name"], "Alice")
        self.assertEqual(alice["total_spent"], 210.5)
        self.assertEqual(alice["order_count"], 2)
        self.assertEqual(alice["average_order_value"], 105.25)
        self.assertEqual(alice["status"], "VIP")

        # Diana: orders [20.00, 35.00, 45.00] -> total=100.00, count=3, AOV=33.33 -> Standard
        diana = next(item for item in data if item["user_id"] == 4)
        self.assertEqual(diana["name"], "Diana")
        self.assertEqual(diana["total_spent"], 100.0)
        self.assertEqual(diana["order_count"], 3)
        self.assertEqual(diana["average_order_value"], 33.33)
        self.assertEqual(diana["status"], "Standard")

    async def test_generate_report_excludes_users_without_valid_orders(self):
        """Verify that Bob (0 orders) and Charlie (corrupted/None orders) are excluded."""
        result = await generate_report()
        data = result["data"]

        user_ids = {item["user_id"] for item in data}
        self.assertNotIn(2, user_ids, "Bob (zero orders) must be excluded from the report")
        self.assertNotIn(3, user_ids, "Charlie (corrupted record) must be excluded from the report")

    async def test_generate_report_concurrency(self):
        """
        Verify that order queries are executed concurrently with asyncio.gather.
        With 4 users each having a 0.8s simulated delay:
        - Sequential execution would take >= 3.2 seconds.
        - Concurrent execution finishes in < 1.6 seconds.
        """
        start = time.perf_counter()
        result = await generate_report()
        elapsed = time.perf_counter() - start

        self.assertIn("data", result)
        self.assertLess(
            elapsed,
            2.0,
            f"Execution took {elapsed:.2f}s; queries should run concurrently in ~0.8-1.2s",
        )

    async def test_resilience_to_upstream_exceptions(self):
        """Verify that an unexpected network exception for a single user does not crash the endpoint."""
        async def mock_fetch_orders(user_id):
            if user_id == 1:
                raise ConnectionResetError("Remote server disconnected")
            return [{"id": 999, "amount": 200.0}]

        with patch("main.fetch_orders_for_user", side_effect=mock_fetch_orders):
            result = await generate_report()
            self.assertIn("data", result)
            data = result["data"]
            user_ids = [item["user_id"] for item in data]
            self.assertNotIn(1, user_ids, "User with exception should be safely omitted")
            # Other users should still be processed
            self.assertGreater(len(data), 0)

    async def test_vip_threshold_boundary(self):
        """
        Verify status tier rules:
        - AOV > 100.00 is 'VIP'
        - AOV <= 100.00 is 'Standard'
        """
        mock_users = [
            {"id": 10, "name": "Boundary Exact 100", "email": "exact@example.com"},
            {"id": 11, "name": "Boundary Above 100", "email": "above@example.com"},
        ]

        async def mock_boundary_orders(user_id):
            if user_id == 10:
                return [{"id": 1, "amount": 100.00}]  # AOV = 100.00 -> Standard
            if user_id == 11:
                return [{"id": 2, "amount": 100.01}]  # AOV = 100.01 -> VIP
            return []

        with patch("main.fetch_users", return_value=mock_users), \
             patch("main.fetch_orders_for_user", side_effect=mock_boundary_orders):
            result = await generate_report()
            data = result["data"]

            exact_user = next(item for item in data if item["user_id"] == 10)
            above_user = next(item for item in data if item["user_id"] == 11)

            self.assertEqual(exact_user["status"], "Standard")
            self.assertEqual(above_user["status"], "VIP")

    async def test_empty_users_list_returns_empty_report(self):
        """Verify that if no users exist, an empty list is returned without errors."""
        with patch("main.fetch_users", return_value=[]):
            result = await generate_report()
            self.assertEqual(result, {"data": []})

    async def test_api_report_http_endpoint_asgi(self):
        """Test full ASGI HTTP request cycle including headers, status code, and CORS."""
        from httpx import AsyncClient, ASGITransport
        from main import app

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/report", headers={"Origin": "http://localhost:3000"})
            self.assertEqual(response.status_code, 200)
            self.assertIn("access-control-allow-origin", response.headers)
            payload = response.json()
            self.assertIn("data", payload)
            self.assertIsInstance(payload["data"], list)
            self.assertEqual(len(payload["data"]), 2)


if __name__ == "__main__":
    unittest.main()
