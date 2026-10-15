import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

const isDevOrTest = ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 50000 : 300, // relaxed in development/test, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 5000 : 20, // relaxed in development/test, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts. Please wait 15 minutes before trying again.',
  },
});

