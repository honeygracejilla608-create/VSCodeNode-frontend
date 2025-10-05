#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 AI Deployment Manager');
console.log('Commands: deploy, status, help, exit');
console.log('Type "deploy" to trigger auto-deployment.');

rl.on('line', (input) => {
  const command = input.trim().toLowerCase();

  if (command === 'deploy') {
    console.log('🚀 Starting deployment process...');
    try {
      // Add all changes
      execSync('git add .', { stdio: 'inherit' });
      console.log('✅ Changes added to git.');

      // Commit with AI-generated message
      const commitMessage = `Auto-deploy triggered by AI at ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log('✅ Changes committed.');

      // Push to trigger GitHub Actions
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Pushed to GitHub. Deployment triggered!');
      console.log('📊 Check GitHub Actions for status: https://github.com/honeygracejilla608-create/VSCodeNode-frontend/actions');

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
    }

  } else if (command === 'status') {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('📝 Uncommitted changes:', status.trim());
      } else {
        console.log('✅ Working directory clean.');
      }
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
    }

  } else if (command === 'help') {
    console.log('Available commands:');
    console.log('- deploy: Commit and push changes to trigger auto-deploy');
    console.log('- status: Check git status');
    console.log('- help: Show this help');
    console.log('- exit: Quit the AI manager');

  } else if (command === 'exit') {
    console.log('👋 Goodbye!');
    rl.close();

  } else {
    console.log('❓ Unknown command. Type "help" for options.');
  }
});

rl.on('close', () => {
  process.exit(0);
});
