const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/auth', createProxyMiddleware({ 
  target: 'http://auth-service:3001', 
  changeOrigin: true 
}));

app.use('/heroes', createProxyMiddleware({ 
  target: 'http://hero-service:3002', 
  changeOrigin: true 
}));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});