// cli/tester.ts
import https from 'https';

import axios from 'axios';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // ⚠️ Accept self-signed certs — only in development
});

const testApi = axios.create({
  baseURL: 'https://localhost:8443/api',
  httpsAgent,
});

const tokens: Map<string, string> = new Map();

async function createUser(username: string, password: string) {
  await testApi.post(`/auth/register`, { username, password });
}

async function loginUser(username: string, password: string): Promise<string> {
  const res = await testApi.post(`auth/login`, { username, password });
  return res.data.token;
}

export async function createUsersCLI(count: number) {
  for (let i = 0; i < count; i++) {
    const username = `user_${Date.now()}_${i}`;
    const password = 'password';
    try {
      await createUser(username, password);
      const token = await loginUser(username, password);
      tokens.set(username, token);
      console.log(`Created user: ${username}`);
    } catch (err) {
      console.error(`Failed to create or login user ${username}`, err);
    }
  }
}
