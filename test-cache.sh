#!/bin/bash

# VelocityEdge - Cache Performance Test Script
# Tests cache behavior and measures performance

VARNISH_URL="http://localhost:8080"
BACKEND_URL="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════╗"
echo "║   VelocityEdge - Cache Performance Test                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Cache MISS
echo "📝 Test 1: First Request (Cache MISS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -H "Cache-Control: no-cache" "$VARNISH_URL/api/fast-data")
END_TIME=$(date +%s%N)
MISS_TIME=$(($(echo "$RESPONSE" | tail -1 | tr -d '\n') * 1000 | bc))

echo "Status: MISS (expected)"
echo "Response Time: ${MISS_TIME}ms"
echo ""
sleep 2

# Test 2: Cache HIT
echo "📝 Test 2: Second Request (Cache HIT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" "$VARNISH_URL/api/fast-data")
END_TIME=$(date +%s%N)
HIT_TIME=$(($(echo "$RESPONSE" | tail -1 | tr -d '\n') * 1000 | bc))

echo "Status: HIT (expected)"
echo "Response Time: ${HIT_TIME}ms"
echo ""

# Calculate improvement
IMPROVEMENT=$(echo "scale=2; (($MISS_TIME - $HIT_TIME) / $MISS_TIME) * 100" | bc)

echo "╔════════════════════════════════════════════════════════╗"
echo "║                 Performance Summary                     ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║  Cache MISS:     ${MISS_TIME}ms                           ║"
echo "║  Cache HIT:      ${HIT_TIME}ms                             ║"
echo "║  Improvement:    ${IMPROVEMENT}%                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Test 3: Stress Test
echo "📝 Test 3: Stress Test (100 Requests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running 100 requests with 10 concurrent connections..."
echo ""

if command -v ab > /dev/null; then
    ab -n 100 -c 10 -g stress_test.tsv "$VARNISH_URL/api/fast-data" | grep -E "Requests per second|Time per request|Transfer rate"
    echo ""
    echo "✅ Results saved to stress_test.tsv"
else
    echo "⚠️  Apache Bench (ab) not found. Skipping stress test."
    echo "Install with: apt-get install apache2-utils (Linux) or brew install httpd (Mac)"
fi

echo ""
echo "✅ Testing complete!"
echo ""
echo "View detailed metrics at: http://localhost:3001"
