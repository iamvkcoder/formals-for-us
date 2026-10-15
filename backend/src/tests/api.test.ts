import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

const app = createApp();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('API Health Checks', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('formals-for-us-backend');
  });

  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Products & Categories API', () => {
  it('GET /api/categories returns active categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/products returns paginated products', async () => {
    const res = await request(app).get('/api/products?page=1&limit=6');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(6);
  });

  it('GET /api/products with category filter filters correctly', async () => {
    const res = await request(app).get('/api/products?category=formal-shirts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((p: any) => {
      expect(p.categorySlug).toBe('formal-shirts');
    });
  });

  it('GET /api/products/:slug returns single product', async () => {
    const res = await request(app).get('/api/products/royal-oxford-classic-dress-shirt');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toContain('Royal Oxford');
    expect(res.body.data.variants.length).toBeGreaterThan(0);
  });

  it('GET /api/search/suggestions returns autocomplete items', async () => {
    const res = await request(app).get('/api/search/suggestions?q=oxford');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Authentication & Authorization', () => {
  const testEmail = `test_${Date.now()}@example.com`;

  it('POST /api/auth/register registers a new customer', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Customer',
      email: testEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe('customer');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate Customer',
      email: testEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login authenticates registered customer', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('Unauthorized user cannot access /api/admin/analytics', async () => {
    // 1. Without token
    const res1 = await request(app).get('/api/admin/analytics');
    expect(res1.status).toBe(401);

    // 2. With customer token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password@123',
    });
    const customerToken = loginRes.body.token;

    const res2 = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res2.status).toBe(403);
  });

  it('Admin user can access /api/admin/analytics', async () => {
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@formalsforus.com',
      password: 'Admin@12345',
    });
    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalProducts).toBeGreaterThan(0);
  });
});

describe('Coupon Validation', () => {
  it('POST /api/coupons/validate verifies valid coupon', async () => {
    const res = await request(app).post('/api/coupons/validate').send({
      code: 'WELCOME10',
      orderAmount: 3000,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.calculatedDiscount).toBe(300); // 10% of 3000
  });

  it('POST /api/coupons/validate rejects subtotal below minimum', async () => {
    const res = await request(app).post('/api/coupons/validate').send({
      code: 'ELEVATE500',
      orderAmount: 2000, // min is 3999
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
