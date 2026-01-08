# 🚀 Quick Start Guide - VelocityEdge

Get VelocityEdge running in **under 2 minutes**!

---

## Prerequisites

✅ **Required**:
- Docker Desktop (v20.10+)
- Docker Compose (v2.0+)
- 2GB RAM available
- Ports 3000, 3001, 8080 available

✅ **Verify Installation**:
```bash
docker --version
# Docker version 20.10.0 or higher

docker-compose --version
# Docker Compose version 2.0.0 or higher
```

---

## Installation Steps

### Step 1: Get the Code

```bash
# Clone the repository
git clone https://github.com/Kimosabey/velocity-edge.git

# Navigate to project directory
cd velocity-edge
```

### Step 2: Start All Services

```bash
# Build and start all containers
docker-compose up --build

# Expected output:
# ✅ Creating network "velocity-network"
# ✅ Building backend...
# ✅ Building frontend...
# ✅ Starting varnish...
# ✅ All services running!
```

**Wait for**:
```
velocity-backend   | 🚀 VelocityEdge Backend API
velocity-backend   | 📍 Port: 3000
velocity-backend   | ⚡ Status: READY
```

### Step 3: Access the Dashboard

Open your browser and navigate to:

**👉 http://localhost:3001**

You should see the VelocityEdge dashboard with animated gradients!

---

## First Test

### Test the Cache Performance

1. **In the dashboard**, click the **"Test Cacheable Endpoint"** button
2. **Observe**: 
   - First request: `X-Cache: MISS` (~500ms) 🐢
   - Response is displayed with headers
3. **Click again immediately**:
   - Second request: `X-Cache: HIT` (~1ms) ⚡
   - Served from Varnish cache!

### Run a Stress Test

1. Click **"Run Stress Test (10 Requests)"**
2. Watch the metrics update:
   - Cache Hits counter increases
   - Hit Rate percentage rises
   - Response times drop dramatically

---

## Manual Testing with cURL

### Test Cacheable Endpoint

```bash
# First request (MISS)
curl -i http://localhost:8080/api/fast-data

# Output:
# HTTP/1.1 200 OK
# X-Cache: MISS          ← Not in cache
# X-Served-By: VelocityEdge-Varnish
# Cache-Control: public, max-age=60

# Second request (HIT)
curl -i http://localhost:8080/api/fast-data

# Output:
# HTTP/1.1 200 OK
# X-Cache: HIT           ← Served from cache!
# X-Cache-Hits: 1        ← Number of hits
```

### Test Non-Cacheable Endpoint

```bash
curl -i http://localhost:8080/api/dynamic-data

# Output:
# Cache-Control: no-cache, no-store, must-revalidate
# Every request bypasses cache
```

---

## Viewing Logs

### All Services
```bash
docker-compose logs -f
```

### Backend Only
```bash
docker-compose logs -f backend

# You'll see:
# 🐢 [BACKEND] Request received at...
# ✅ [BACKEND] Response sent in 502ms
```

### Varnish Only
```bash
docker-compose logs -f varnish
```

---

## Stopping & Restarting

### Stop Services
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Restart Services
```bash
# Restart without rebuilding
docker-compose up

# Rebuild and restart
docker-compose up --build
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux

# Kill the process or change port in docker-compose.yml
```

### Backend Not Starting

**Check logs**:
```bash
docker-compose logs backend

# Common issues:
# - npm install failed → Delete node_modules, rebuild
# - Port 3000 in use → Change in docker-compose.yml
```

### Dashboard Shows Connection Error

**Checklist**:
1. ✅ All containers running: `docker-compose ps`
2. ✅ Backend healthy: `curl http://localhost:3000/health`
3. ✅ Varnish accessible: `curl http://localhost:8080/health`
4. ✅ Clear browser cache (Ctrl+Shift+R)

---

## Advanced Configuration

### Change Backend Delay

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - SIMULATED_DELAY=1000  # 1 second delay
```

Then restart:
```bash
docker-compose up -d backend
```

### Increase Cache Size

Edit `docker-compose.yml`:
```yaml
services:
  varnish:
    environment:
      - VARNISH_SIZE=512M  # Increased from 256M
```

### Clear Cache Manually

```bash
# Restart Varnish (clears in-memory cache)
docker-compose restart varnish
```

---

## What's Next?

✅ **Explore the Dashboard**:
- View real-time metrics
- Test different endpoints
- Run stress tests
- Check request history

✅ **Read the Documentation**:
- [Architecture Guide](ARCHITECTURE.md) - Deep dive into design
- [README](../README.md) - Full project overview

✅ **Experiment**:
- Modify VCL configuration (`varnish/default.vcl`)
- Add custom endpoints (`api/index.js`)
- Create new test scenarios

---

## Success Checklist

- [x] Docker services running
- [x] Dashboard accessible at http://localhost:3001
- [x] First cache MISS observed (~500ms)
- [x] Second cache HIT observed (~1ms)
- [x] Metrics updating in real-time
- [x] Understanding the 99% improvement! 🎉

---

**You're all set! 🚀 Start exploring VelocityEdge's edge caching performance!**

Need help? Check the [main README](../README.md) or open an issue on GitHub.
