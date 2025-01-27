const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerMerge = require('swagger-merge');

const app = express();

const services = {
  auth: 'http://auth-service:3001',
  heroes: 'http://hero-service:3002',
  dungeons: 'http://dungeon-service:3003',
  combats: 'http://combat-service:3004',
};

// Middleware for proxies
app.use('/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true }));
app.use('/heroes', createProxyMiddleware({ target: services.heroes, changeOrigin: true }));
app.use('/dungeons', createProxyMiddleware({ target: services.dungeons, changeOrigin: true }));
app.use('/combats', createProxyMiddleware({ target: services.combats, changeOrigin: true }));

// Fetch and aggregate Swagger docs
app.get('/api-docs', async (req, res, next) => {
  try {
    const specs = await Promise.all(
        Object.values(services).map(service => axios.get(`${service}/api-docs`).then(res => res.data))
    );

    const mergedSpecs = swaggerMerge.merge(specs); // Combine all specs
    res.json(mergedSpecs);
  } catch (error) {
    console.error('Error fetching Swagger docs:', error.message);
    res.status(500).json({ error: 'Failed to load API documentation' });
  }
});

// Serve Swagger UI
app.use(
    '/swagger-ui',
    swaggerUi.serve,
    async (req, res, next) => {
      try {
        const specs = await Promise.all(
            Object.values(services).map(service => axios.get(`${service}/api-docs`).then(res => res.data))
        );
        const mergedSpecs = swaggerMerge.merge(specs);
        swaggerUi.setup(mergedSpecs)(req, res, next);
      } catch (error) {
        next(error);
      }
    }
);

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
