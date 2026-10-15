import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/formals_for_us',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PYTHON_API_URL: process.env.PYTHON_API_URL || 'http://127.0.0.1:8000',
  PAYMENT_PROVIDER_KEY_ID: process.env.PAYMENT_PROVIDER_KEY_ID || '',
  PAYMENT_PROVIDER_KEY_SECRET: process.env.PAYMENT_PROVIDER_KEY_SECRET || '',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || '',
  SHIPPING: {
    FREE_THRESHOLD: 1999, // Free shipping on orders over ₹1999
    STANDARD_FEE: 150,     // Standard delivery fee
    EXPRESS_FEE: 250,      // Express delivery fee
  },
  TAX: {
    RATE: 0.12, // 12% GST standard apparel
  }
};
