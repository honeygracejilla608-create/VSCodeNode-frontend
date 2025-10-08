#!/usr/bin/env node

/**
 * Example: Using API Keys with Todo API
 *
 * This example demonstrates how to:
 * 1. Generate a JWT token
 * 2. Generate an API key
 * 3. Use the API key for authentication
 * 4. Validate API key functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ ${response.status}: ${response.statusText}`);
      console.log(data);
      return null;
    }

    return data;
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return null;
  }
}

async function demonstrateAPIKeys() {
  console.log('🚀 Todo API - API Key Integration Demo');
  console.log('=' .repeat(50));

  const userEmail = 'demo@example.com';

  // Step 1: Generate JWT token (for initial authentication)
  console.log('\n1️⃣ Generating JWT token...');
  const tokenResponse = await makeRequest('/api/generate-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail })
  });

  if (!tokenResponse) {
    console.log('❌ Failed to generate token. Is the server running?');
    return;
  }

  const jwtToken = tokenResponse.token;
  console.log(`✅ JWT Token: ${jwtToken.substring(0, 20)}...`);

  // Step 2: Generate API key
  console.log('\n2️⃣ Generating API key...');
  const keyResponse = await makeRequest('/api/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({ expiresInHours: 24 })
  });

  if (!keyResponse) {
    console.log('❌ Failed to generate API key');
    return;
  }

  console.log(`✅ API Key generated: ${keyResponse.id}`);
  console.log(`📧 Check ${userEmail} for the API key email!`);

  // Step 3: List user's API keys
  console.log('\n3️⃣ Listing user API keys...');
  const keysResponse = await makeRequest('/api/keys', {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });

  if (keysResponse) {
    console.log(`✅ Found ${keysResponse.length} API key(s)`);
    keysResponse.forEach((key, index) => {
      console.log(`   ${index + 1}. ID: ${key.id}`);
      console.log(`      Created: ${key.createdAt}`);
      console.log(`      Expires: ${key.expiresAt}`);
      console.log(`      Active: ${key.isActive}`);
      console.log(`      Usage: ${key.usageCount} times`);
    });
  }

  // Step 4: Demonstrate API key validation
  console.log('\n4️⃣ API Key validation demo...');

  // First, let's simulate getting the actual API key from email
  // In real usage, you'd extract this from the email
  console.log('📧 In real usage, extract API key from email...');
  console.log('🔐 For demo, we show validation endpoint:');

  // Show validation endpoint (would need actual key)
  console.log('POST /api/auth/validate-key');
  console.log('Body: { "apiKey": "your-32-char-api-key" }');
  console.log('Response: { "valid": true, "user": "demo@example.com", "expiresAt": "..." }');

  // Step 5: Demonstrate task creation with JWT (not API key)
  console.log('\n5️⃣ Creating a task with JWT authentication...');
  const taskResponse = await makeRequest('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      title: 'Test task from API demo',
      description: 'Created during API key integration demo',
      completed: false
    })
  });

  if (taskResponse) {
    console.log(`✅ Task created: ${taskResponse.title}`);
    console.log(`📝 Description: ${taskResponse.description}`);
    console.log(`👤 User: ${taskResponse.user}`);
  }

  // Step 6: List all tasks
  console.log('\n6️⃣ Listing all tasks...');
  const tasksResponse = await makeRequest('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  });

  if (tasksResponse) {
    console.log(`✅ Found ${tasksResponse.length} task(s)`);
    tasksResponse.slice(-3).forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.completed ? '✅' : '⏳'})`);
    });
  }

  console.log('\n🎉 Demo completed successfully!');
  console.log('\n📚 Next steps:');
  console.log('1. Check your email for the API key');
  console.log('2. Use the API key for programmatic access');
  console.log('3. Try the web interface at http://localhost:5173');
  console.log('4. Explore more API endpoints in the documentation');
}

async function main() {
  if (process.argv[2] === '--help') {
    console.log(`
Todo API - API Key Demo

Usage:
  node demo.js              # Run full demo
  node demo.js --help       # Show this help

Demo flow:
1. Generate JWT token for authentication
2. Generate API key (sent via email)
3. List user's API keys
4. Create a task with JWT auth
5. List all tasks

Make sure the server is running:
  npm run dev

And check your email for API keys!
    `);
    return;
  }

  await demonstrateAPIKeys();
}

if (require.main === module) {
  main().catch(console.error);
}
