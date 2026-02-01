# 🚀 Getting Started: VelocityEdge

> **Prerequisites**
> *   **Docker Desktop** (Engine + Compose)
> *   **Node.js 18+**

![Dashboard Preview](./assets/dashboard-preview.png)

---

## 1. Environment Setup

**Ports Used**:
*   `8081`: Varnish (The Public Gateway)
*   `3000`: Node.js API (Protected)
*   `5173`: React Dashboard

---

## 2. Installation & Launch

### Step 1: Start Infrastructure (Varnish + Backend)
```bash
docker-compose up -d --build
```
*Wait ~10 seconds for Varnish to initialize.*

### Step 2: Start Metrics Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Usage Guide

### A. Access Interface
Go to **`http://localhost:5173`**.
You will see two panels:
1.  **Direct API**: Simulates hitting the backend directly (Slow).
2.  **Edge Cache**: Hits Varnish (Fast).

### B. Manual CLI Testing
Verify the headers yourself with `curl`.

```bash
# 1. Warm the Cache (First Hit = MSS)
curl -I http://localhost:8081/api/fast-data
# Expect: X-Cache: MISS

# 2. Benefit (Second Hit = HIT)
curl -I http://localhost:8081/api/fast-data
# Expect: X-Cache: HIT
```

---

## 4. Running Benchmarks

We include a script to verify the throughput difference.

```powershell
# Windows
.\test-cache.ps1

# Linux/Mac
./test-cache.sh
```

**Expected Result**:
*   **Direct**: ~2 req/sec (Limited by 500ms sleep)
*   **Cached**: ~2000+ req/sec (Limited only by CPU)
