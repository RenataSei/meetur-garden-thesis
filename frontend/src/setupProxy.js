const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This means it will only proxy requests that start with /api
    createProxyMiddleware({
      target: 'http://localhost:4000', // Your backend server
      changeOrigin: true,
    })
  );
};