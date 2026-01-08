const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const SIMULATED_DELAY = parseInt(process.env.SIMULATED_DELAY) || 5000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Request counter for analytics
let requestCounter = {
  total: 0,
  byEndpoint: {}
};

// Middleware to track requests
app.use((req, res, next) => {
  requestCounter.total++;
  const endpoint = req.path;
  requestCounter.byEndpoint[endpoint] = (requestCounter.byEndpoint[endpoint] || 0) + 1;
  next();
});

/**
 * 🐢 SLOW ENDPOINT - Simulates database latency
 * This endpoint will be cached by Varnish
 */
app.get('/api/fast-data', async (req, res) => {
  const startTime = Date.now();

  console.log(`🐢 [BACKEND] Request received at ${new Date().toISOString()}`);

  // Simulate slow database query
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));

  const responseTime = Date.now() - startTime;

  const responseData = {
    data: "This is cached content from VelocityEdge",
    timestamp: Date.now(),
    isoTimestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    message: "✅ Backend processed this request (should be cached)",
    metadata: {
      endpoint: '/api/fast-data',
      cacheable: true,
      ttl: 60
    }
  };

  // Set cache headers (Varnish will respect these)
  res.set({
    'Cache-Control': 'public, max-age=60, s-maxage=60',
    'X-Backend-Response-Time': `${responseTime}ms`,
    'X-Request-ID': `req-${Date.now()}`,
    'Content-Type': 'application/json'
  });

  console.log(`✅ [BACKEND] Response sent in ${responseTime}ms`);
  res.json(responseData);
});

/**
 * 🚫 NON-CACHEABLE ENDPOINT - Always bypasses cache
 */
app.get('/api/dynamic-data', async (req, res) => {
  const startTime = Date.now();

  console.log(`⚡ [BACKEND] Dynamic request received at ${new Date().toISOString()}`);

  // Simulate some processing (Same delay as main endpoint for fair comparison)
  await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));

  const responseTime = Date.now() - startTime;

  // Explicitly prevent caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Backend-Response-Time': `${responseTime}ms`
  });

  res.json({
    data: "This is always fresh, never cached",
    timestamp: Date.now(),
    randomValue: Math.random(),
    responseTime: `${responseTime}ms`,
    message: "⚡ This endpoint bypasses the cache"
  });
});

/**
 * 📊 ANALYTICS ENDPOINT
 */
app.get('/api/analytics', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({
    totalRequests: requestCounter.total,
    requestsByEndpoint: requestCounter.byEndpoint,
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/**
 * ❤️ HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'velocity-edge-backend',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

/**
 * 🏠 HOME
 */
app.get('/', (req, res) => {
  res.json({
    service: 'VelocityEdge Backend API',
    version: '1.0.0',
    endpoints: {
      '/api/fast-data': 'Cacheable endpoint (500ms delay)',
      '/api/dynamic-data': 'Non-cacheable endpoint (100ms delay)',
      '/api/analytics': 'Request analytics',
      '/health': 'Health check'
    },
    simulatedDelay: `${SIMULATED_DELAY}ms`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ [ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 VelocityEdge Backend API                        ║
║   📍 Port: ${PORT}                                      ║
║   🐢 Simulated Delay: ${SIMULATED_DELAY}ms                        ║
║   ⚡ Status: READY                                    ║
╚═══════════════════════════════════════════════════════╝
  `);
});
