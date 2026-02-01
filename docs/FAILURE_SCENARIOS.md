# 🛡️ Failure Scenarios & Resilience: VelocityEdge

> "The Cache is the shield. The Backend is the castle."

This document details how Varnish protects the backend from traffic spikes and outages.

![Workflow](./assets/sytem-flow.png)

---

## 1. Failure Matrix

| Component | Failure Mode | Impact | Recovery Strategy |
| :--- | :--- | :--- | :--- |
| **Backend API** | Crash / Downtime | **Minor**. Stale data served. | **Grace Mode**. Varnish serves the last known good copy for 1 hour. Users see data, just not *new* data. |
| **Backend API** | DB Traffic Spike | **None**. Cache absorbs hits. | **Request Coalescing**. Varnish merges 1000 simultaneous requests into 1 backend call. |
| **Varnish** | Service Crash | **Critical**. API Offline. | **Docker Restart**. Compose policy `restart: always` brings it back in <2s. |

---

## 2. Deep Dive: Grace Mode (The Facade)

### The Scenario
Your database is undergoing maintenance (30 mins downtime). In a normal app, every user gets a `503 Service Unavailable`.

### The Solution: `beresp.grace`
Varnish keeps "Expired" objects in memory.
*   **Request 1**: Varnish asks Backend "Do you have new data?".
*   **Backend**: *Connection Refused*.
*   **Varnish**: "Okay, I'll serve the 5-minute old version I have in my pocket."
*   **User**: Sees content (200 OK).

This effectively decouples **Availability** from **freshness**.

---

## 3. Resilience Testing

### Test 1: The "Backend Kill" Check
1.  Load the content to warm the cache.
2.  Kill the API: `docker stop velocity-api`.
3.  Refresh the page.
4.  **Expectation**: The page **still loads** instantly. The Dashboard might show "Stale Cache" warning, but no 500 error.

### Test 2: The "Thundering Herd"
1.  Use `ab` (Apache Bench) to send 100 concurrent requests to a *cold* endpoint.
2.  Check Docker logs for the API.
3.  **Expectation**: You should see exactly **1 log entry** for the request. Varnish queued the other 99 and served them the result of the 1st one.
