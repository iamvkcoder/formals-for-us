import mongoose from 'mongoose';
import dns from 'node:dns';
import { ENV } from './env.js';

// Resolve SRV records reliably on networks/routers where default local DNS refuses querySrv
if (ENV.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {
    // Fall back to default OS resolver if restricted
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('[MongoDB] Disconnected from database');
}
