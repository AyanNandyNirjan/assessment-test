from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import asyncio
import logging

logger = logging.getLogger("aggregator.report")

app = FastAPI(
    title="The Aggregator API",
    description="High-performance customer order aggregation and reporting service.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomerReportItem(BaseModel):
    user_id: int = Field(..., description="Unique customer identifier")
    name: str = Field(..., description="Customer display name")
    total_spent: float = Field(..., description="Total amount spent across all orders")
    order_count: int = Field(..., description="Total number of valid orders placed")
    average_order_value: float = Field(..., description="Average order value (AOV)")
    status: Literal["VIP", "Standard"] = Field(..., description="Customer tier based on AOV threshold (> $100 is VIP)")

class ReportResponse(BaseModel):
    data: List[CustomerReportItem]

# MOCK EXTERNAL API / DATABASE
# Do not modify the behavior of these mock functions. 
# You may only modify the generate_report endpoint below.

async def fetch_users():
    """Simulates fetching users from a database."""
    return [
        {"id": 1, "name": "Alice", "email": "alice@example.com"},
        {"id": 2, "name": "Bob", "email": "bob@example.com"},
        {"id": 3, "name": "Charlie", "email": "charlie@example.com"}, # Charlie has bad data
        {"id": 4, "name": "Diana", "email": "diana@example.com"}
    ]

async def fetch_orders_for_user(user_id: int):
    """Simulates a slow database query fetching orders for a specific user."""
    # Simulating network latency (0.8 seconds)
    await asyncio.sleep(0.8)
    
    orders_db = {
        1: [{"id": 101, "amount": 50.00}, {"id": 102, "amount": 160.50}],
        2: [], # Bob has no orders
        4: [{"id": 103, "amount": 20.00}, {"id": 104, "amount": 35.00}, {"id": 105, "amount": 45.00}]
    }
    
    # Simulating a silent failure / corrupt record from the database for Charlie
    if user_id == 3:
        return None
        
    return orders_db.get(user_id, [])

@app.get("/api/report", response_model=ReportResponse)
async def generate_report():
    """
    Generate an aggregated user order report.

    - Fetch order data concurrently for better performance.
    - Treat missing/corrupt order data as empty so one bad record does not crash the report.
    - Exclude users with no valid orders.
    - Calculate total spend, order count, AOV, and customer status.
    """
    logger.info("Starting report generation...")

    users = await fetch_users()

    # Fan out the independent order requests concurrently instead of awaiting
    # each one sequentially. return_exceptions=True keeps one failed upstream
    # request from crashing the whole report.
    order_results = await asyncio.gather(
        *(fetch_orders_for_user(user["id"]) for user in users),
        return_exceptions=True,
    )

    report = []

    for user, result in zip(users, order_results):
        # A failed request, None, or another unexpected payload is treated as
        # no orders for that user and is therefore filtered out below.
        orders = result if isinstance(result, list) else []

        if not orders:
            continue

        total_spent = sum(order["amount"] for order in orders)
        order_count = len(orders)
        average_order_value = total_spent / order_count

        report.append({
            "user_id": user["id"],
            "name": user["name"],
            "total_spent": round(total_spent, 2),
            "order_count": order_count,
            "average_order_value": round(average_order_value, 2),
            "status": "VIP" if average_order_value > 100 else "Standard",
        })

    return {"data": report}
