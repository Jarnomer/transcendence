#!/usr/bin/env node

/**
 * Production startup script for the backend services
 * with pre-configured module resolution
 */

const { spawn } = require('child_process');
const fs = require('fs');
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

// Verify that all symlinks are correctly set up
function verifyModuleLinks() {
  console.log(`${colors.blue}Verifying module symlinks...${colors.reset}`);

  const links = [
    { source: '@shared', target: '/app/shared/dist' },
    { source: '@my-backend/main_server', target: '/app/backend/dist/backend/services/main_server' },
    {
      source: '@my-backend/game_service',
      target: '/app/backend/dist/backend/services/game_service',
    },
    {
      source: '@my-backend/matchmaking_service',
      target: '/app/backend/dist/backend/services/matchmaking_service',
    },
    {
      source: '@my-backend/remote_service',
      target: '/app/backend/dist/backend/services/remote_service',
    },
    {
      source: '@my-backend/user_service',
      target: '/app/backend/dist/backend/services/user_service',
    },
  ];

  let allValid = true;

  links.forEach((link) => {
    const modulePath = `/app/node_modules/${link.source}`;

    if (!fs.existsSync(modulePath)) {
      console.log(`${colors.red}Module link not found: ${link.source}${colors.reset}`);
      console.log(
        `${colors.yellow}Creating symlink from ${link.target} to ${modulePath}${colors.reset}`
      );

      try {
        // Ensure the parent directory exists
        const parentDir = path.dirname(modulePath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        fs.symlinkSync(link.target, modulePath, 'dir');
      } catch (err) {
        console.error(`${colors.red}Failed to create symlink: ${err.message}${colors.reset}`);
        allValid = false;
      }
    } else {
      const stats = fs.lstatSync(modulePath);
      if (!stats.isSymbolicLink()) {
        console.log(`${colors.red}${modulePath} exists but is not a symlink${colors.reset}`);
        allValid = false;
      } else {
        const target = fs.readlinkSync(modulePath);
        if (target !== link.target) {
          console.log(
            `${colors.yellow}Symlink ${modulePath} points to ${target} instead of ${link.target}${colors.reset}`
          );
          allValid = false;
        } else {
          console.log(
            `${colors.green}Verified symlink: ${link.source} -> ${link.target}${colors.reset}`
          );
        }
      }
    }
  });

  return allValid;
}

// Service definitions with their respective colors and dependencies
const services = [
  {
    name: 'main_server',
    path: './backend/dist/backend/services/main_server/src/index.js',
    color: colors.blue,
    dependencies: [],
  },
  {
    name: 'user_service',
    path: './backend/dist/backend/services/user_service/src/index.js',
    color: colors.green,
    dependencies: ['main_server'],
  },
  {
    name: 'game_service',
    path: './backend/dist/backend/services/game_service/src/index.js',
    color: colors.yellow,
    dependencies: ['main_server'],
  },
  {
    name: 'matchmaking_service',
    path: './backend/dist/backend/services/matchmaking_service/src/index.js',
    color: colors.magenta,
    dependencies: ['main_server', 'game_service'],
  },
  {
    name: 'remote_service',
    path: './backend/dist/backend/services/remote_service/src/index.js',
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
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NODE_PATH: '/app/node_modules:/app',
    },
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

  // Verify module links before starting services
  if (!verifyModuleLinks()) {
    console.error(
      `${colors.red}Module links verification failed - services may not function correctly${colors.reset}`
    );
  }

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
