#!/usr/bin/env node

/**
 * Production startup script for the backend services
 */

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Service definitions with their respective colors
const services = [
  {
    name: 'main_server',
    path: './services/main_server/dist/index.js',
    color: colors.blue,
    dependencies: [],
  },
  {
    name: 'user_service',
    path: './services/user_service/dist/index.js',
    color: colors.green,
    dependencies: ['main_server'],
  },
  {
    name: 'game_service',
    path: './services/game_service/dist/index.js',
    color: colors.yellow,
    dependencies: ['main_server'],
  },
  {
    name: 'matchmaking_service',
    path: './services/matchmaking_service/dist/index.js',
    color: colors.magenta,
    dependencies: ['main_server', 'game_service'],
  },
  {
    name: 'remote_service',
    path: './services/remote_service/dist/index.js',
    color: colors.cyan,
    dependencies: ['main_server', 'matchmaking_service'],
  },
];

// Track running services
const runningServices = new Map();

// Start a service
function startService(service) {
  console.log(`${service.color}Starting ${service.name}...${colors.reset}`);

  const nodeProcess = spawn('node', [service.path], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'pipe',
  });

  runningServices.set(service.name, nodeProcess);

  nodeProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      console.log(`${service.color}[${service.name}] ${line}${colors.reset}`);
    });
  });

  nodeProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      console.error(`${colors.red}[${service.name}] ${line}${colors.reset}`);
    });
  });

  nodeProcess.on('close', (code) => {
    console.log(`${colors.red}[${service.name}] Service exited with code ${code}${colors.reset}`);
    runningServices.delete(service.name);

    // Restart the service if it crashes
    if (code !== 0) {
      console.log(`${service.color}Restarting ${service.name}...${colors.reset}`);
      setTimeout(() => startService(service), 5000);
    }
  });

  return nodeProcess;
}

// Start services in the correct order
async function startAll() {
  console.log(`${colors.green}Starting all services in production mode...${colors.reset}`);

  // Start services with no dependencies first
  const started = new Set();

  // Keep trying to start services until all are running
  while (started.size < services.length) {
    for (const service of services) {
      if (started.has(service.name)) continue;

      // Check if all dependencies are started
      const depsReady = service.dependencies.every((dep) => started.has(dep));

      if (depsReady) {
        startService(service);
        started.add(service.name);

        // Wait a moment before starting the next service
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // If we haven't started all services yet, wait a bit before checking again
    if (started.size < services.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`${colors.green}All services started successfully!${colors.reset}`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(`${colors.yellow}Shutting down all services...${colors.reset}`);

  runningServices.forEach((process, name) => {
    console.log(`${colors.yellow}Stopping ${name}...${colors.reset}`);
    process.kill('SIGTERM');
  });

  // Force exit after a timeout
  setTimeout(() => {
    console.log(`${colors.red}Force exiting...${colors.reset}`);
    process.exit(0);
  }, 5000);
});

// Start everything
startAll().catch((err) => {
  console.error(`${colors.red}Failed to start services: ${err.message}${colors.reset}`);
  process.exit(1);
});
