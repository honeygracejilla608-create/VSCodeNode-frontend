#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ai/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('AI services are healthy');
    process.exit(0);
  } else {
    console.error(`AI health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('AI health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('AI health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
