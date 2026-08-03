import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          let val = trimmed.substring(idx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch {
    // Ignore error loading .env
  }
}

function getFreshClient(): PrismaClient {
  try {
    if (typeof require !== 'undefined' && require.cache) {
      Object.keys(require.cache).forEach((key) => {
        if (key.includes('@prisma/client') || key.includes('.prisma')) {
          delete require.cache[key];
        }
      });
    }
  } catch {
    // Edge runtime fallback
  }

  const { PrismaClient: FreshPrismaClient } = require('@prisma/client');
  return new FreshPrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

let activeClient = getFreshClient();

export const prisma = new Proxy(activeClient as any, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof prop === 'string' && ['passenger', 'booking', 'admin', 'vehicle', 'service', 'siteSetting'].includes(prop) && !value) {
      activeClient = getFreshClient();
      return (activeClient as any)[prop];
    }
    return value;
  },
}) as PrismaClient;
