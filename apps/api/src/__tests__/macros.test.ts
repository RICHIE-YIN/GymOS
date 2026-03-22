/**
 * Integration tests for the Macros module
 *
 * Endpoints covered:
 *   POST  /api/v1/macros/calculate      – calculate macros from profile data
 *   GET   /api/v1/me/macros/current     – get the active macro plan
 *   PATCH /api/v1/me/macros/current     – update (override) the macro plan
 *
 * PrismaClient and the auth middleware are mocked so no real database or
 * JWT signing is required beyond generating a valid token for the test user.
 */

import request from 'supertest';
import app from '../index';
import { generateToken } from '../lib/jwt';

// ---------------------------------------------------------------------------
// Mock PrismaClient
// ---------------------------------------------------------------------------

jest.mock('../lib/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    macroPlan: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    dailyNutritionLog: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma };
});

import prisma from '../lib/prisma';

const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockMacroPlanFindFirst = prisma.macroPlan.findFirst as jest.Mock;
const mockMacroPlanUpdateMany = prisma.macroPlan.updateMany as jest.Mock;
const mockMacroPlanCreate = prisma.macroPlan.create as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = '/api/v1';

const TEST_USER_ID = 'user_cuid_macro_test';

/** Generate a JWT for the test user (no DB needed). */
function makeAuthToken(role = 'CLIENT'): string {
  return generateToken({
    userId: TEST_USER_ID,
    email: 'macro-tester@example.com',
    role,
  });
}

function buildMacroPlan(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'plan_cuid_001',
    userId: TEST_USER_ID,
    sourceType: 'SYSTEM_DEFAULT',
    calories: 2200,
    protein: 165,
    carbs: 248,
    fat: 61,
    effectiveStartDate: new Date('2024-01-01T00:00:00.000Z'),
    effectiveEndDate: null,
    isActive: true,
    ...overrides,
  };
}

/** Minimal user record required by the macros service. */
function buildUser() {
  return {
    id: TEST_USER_ID,
    email: 'macro-tester@example.com',
    firstName: 'Mac',
    lastName: 'Rotest',
    role: 'CLIENT',
    isActive: true,
  };
}

// ---------------------------------------------------------------------------
// POST /api/v1/macros/calculate
// ---------------------------------------------------------------------------

describe('POST /api/v1/macros/calculate', () => {
  const token = makeAuthToken();

  const validPayload = {
    heightCm: 175,
    currentWeightKg: 80,
    activityLevel: 'MODERATELY_ACTIVE',
    goalType: 'GAIN_MUSCLE',
    gender: 'male',
    age: 28,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserFindUnique.mockResolvedValue(buildUser());
  });

  it('returns 200 with correct macro fields for a valid payload', async () => {
    const res = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.macros).toHaveProperty('calories');
    expect(res.body.data.macros).toHaveProperty('protein');
    expect(res.body.data.macros).toHaveProperty('carbs');
    expect(res.body.data.macros).toHaveProperty('fat');
  });

  it('returns positive integer macros', async () => {
    const res = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send(validPayload);

    const { calories, protein, carbs, fat } = res.body.data.macros;
    expect(calories).toBeGreaterThan(0);
    expect(protein).toBeGreaterThan(0);
    expect(carbs).toBeGreaterThanOrEqual(0);
    expect(fat).toBeGreaterThan(0);
    expect(Number.isInteger(calories)).toBe(true);
    expect(Number.isInteger(protein)).toBe(true);
    expect(Number.isInteger(carbs)).toBe(true);
    expect(Number.isInteger(fat)).toBe(true);
  });

  it('applies a calorie surplus for GAIN_MUSCLE goal', async () => {
    // GAIN_MUSCLE adds +300 kcal to TDEE; result should be > a MAINTAIN baseline
    const resGain = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validPayload, goalType: 'GAIN_MUSCLE' });

    const resMaintain = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validPayload, goalType: 'MAINTAIN' });

    expect(resGain.body.data.macros.calories).toBeGreaterThan(
      resMaintain.body.data.macros.calories,
    );
  });

  it('applies a calorie deficit for LOSE_WEIGHT goal', async () => {
    const resLose = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validPayload, goalType: 'LOSE_WEIGHT' });

    const resMaintain = await request(app)
      .post(`${BASE}/macros/calculate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validPayload, goalType: 'MAINTAIN' });

    expect(resLose.body.data.macros.calories).toBeLessThan(
      resMaintain.body.data.macros.calories,
    );
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`${BASE}/macros/calculate`)
      .send(validPayload);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/me/macros/current
// ---------------------------------------------------------------------------

describe('GET /api/v1/me/macros/current', () => {
  const token = makeAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with the active macro plan', async () => {
    mockMacroPlanFindFirst.mockResolvedValue(buildMacroPlan());

    const res = await request(app)
      .get(`${BASE}/me/macros/current`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan).toHaveProperty('calories', 2200);
    expect(res.body.data.plan).toHaveProperty('protein', 165);
    expect(res.body.data.plan).toHaveProperty('carbs', 248);
    expect(res.body.data.plan).toHaveProperty('fat', 61);
    expect(res.body.data.plan.isActive).toBe(true);
  });

  it('returns 404 when no active macro plan exists', async () => {
    mockMacroPlanFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`${BASE}/me/macros/current`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get(`${BASE}/me/macros/current`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/me/macros/current
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/me/macros/current', () => {
  const token = makeAuthToken();

  const updatePayload = {
    calories: 2400,
    protein: 180,
    carbs: 270,
    fat: 67,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with the newly created macro plan', async () => {
    mockMacroPlanUpdateMany.mockResolvedValue({ count: 1 });
    mockMacroPlanFindFirst.mockResolvedValue(buildMacroPlan()); // previous plan for fallback
    mockMacroPlanCreate.mockResolvedValue(
      buildMacroPlan({ ...updatePayload, sourceType: 'USER_CUSTOM' }),
    );

    const res = await request(app)
      .patch(`${BASE}/me/macros/current`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plan.calories).toBe(2400);
    expect(res.body.data.plan.protein).toBe(180);
  });

  it('deactivates the previous plan before creating the new one', async () => {
    mockMacroPlanUpdateMany.mockResolvedValue({ count: 1 });
    mockMacroPlanFindFirst.mockResolvedValue(buildMacroPlan());
    mockMacroPlanCreate.mockResolvedValue(buildMacroPlan(updatePayload));

    await request(app)
      .patch(`${BASE}/me/macros/current`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatePayload);

    expect(mockMacroPlanUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: TEST_USER_ID, isActive: true },
        data: expect.objectContaining({ isActive: false }),
      }),
    );
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .patch(`${BASE}/me/macros/current`)
      .send(updatePayload);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
