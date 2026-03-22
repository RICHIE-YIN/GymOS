/**
 * Integration tests for the Auth module
 *
 * Endpoints covered:
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/login
 *   GET  /api/v1/auth/me
 *
 * PrismaClient is mocked so no real database connection is required.
 */

import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../index';

// ---------------------------------------------------------------------------
// Mock PrismaClient
// ---------------------------------------------------------------------------

jest.mock('../lib/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma };
});

import prisma from '../lib/prisma';

// Typed convenience references
const mockUserFindUnique = prisma.user.findUnique as jest.Mock;
const mockUserCreate = prisma.user.create as jest.Mock;
const mockSubscriptionCreate = prisma.subscription.create as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = '/api/v1';

/** A minimal user record returned by prisma.user.create / findUnique */
function buildUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user_cuid_001',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'CLIENT',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    userProfile: null,
    trainerProfile: null,
    subscription: null,
    ...overrides,
  };
}

/** A user record that includes the password hash (for login lookups) */
async function buildUserWithHash(password = 'Password1') {
  const passwordHash = await bcrypt.hash(password, 4); // fast rounds for tests
  return { ...buildUser(), passwordHash };
}

// ---------------------------------------------------------------------------
// POST /api/v1/auth/register
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/register', () => {
  const validPayload = {
    email: 'jane@example.com',
    password: 'Password1',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with user data and tokens on success', async () => {
    mockUserFindUnique.mockResolvedValue(null); // no existing user
    mockUserCreate.mockResolvedValue(buildUser());
    mockSubscriptionCreate.mockResolvedValue({ id: 'sub_001' });

    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when the email is already registered', async () => {
    mockUserFindUnique.mockResolvedValue(buildUser()); // existing user

    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 422 when the email is invalid', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ ...validPayload, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('email');
  });

  it('returns 422 when the password is too short', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ ...validPayload, password: 'short1' });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveProperty('password');
  });

  it('returns 422 when the password has no uppercase letter', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ ...validPayload, password: 'password1' });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveProperty('password');
  });

  it('returns 422 when the password has no digit', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ ...validPayload, password: 'PasswordOnly' });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveProperty('password');
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ email: 'jane@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('defaults role to CLIENT when role is omitted', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue(buildUser({ role: 'CLIENT' }));
    mockSubscriptionCreate.mockResolvedValue({ id: 'sub_001' });

    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('CLIENT');
  });

  it('accepts role TRAINER', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    mockUserCreate.mockResolvedValue(buildUser({ role: 'TRAINER' }));
    mockSubscriptionCreate.mockResolvedValue({ id: 'sub_001' });

    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({ ...validPayload, role: 'TRAINER' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('TRAINER');
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with token on valid credentials', async () => {
    const userWithHash = await buildUserWithHash('Password1');
    mockUserFindUnique.mockResolvedValue(userWithHash);

    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'jane@example.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('returns 401 when the password is wrong', async () => {
    const userWithHash = await buildUserWithHash('Password1');
    mockUserFindUnique.mockResolvedValue(userWithHash);

    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'jane@example.com', password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when the user does not exist', async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'ghost@example.com', password: 'Password1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 when the account is deactivated', async () => {
    const userWithHash = await buildUserWithHash('Password1');
    mockUserFindUnique.mockResolvedValue({ ...userWithHash, isActive: false });

    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'jane@example.com', password: 'Password1' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_DEACTIVATED');
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'jane@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when the email format is invalid', async () => {
    const res = await request(app)
      .post(`${BASE}/auth/login`)
      .send({ email: 'not-an-email', password: 'Password1' });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveProperty('email');
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/auth/me
// ---------------------------------------------------------------------------

describe('GET /api/v1/auth/me', () => {
  /** Sign up a test user and grab the JWT. */
  async function getValidToken(): Promise<string> {
    mockUserFindUnique.mockResolvedValueOnce(null); // registration: no existing user
    mockUserCreate.mockResolvedValueOnce(buildUser());
    mockSubscriptionCreate.mockResolvedValueOnce({ id: 'sub_001' });

    const res = await request(app)
      .post(`${BASE}/auth/register`)
      .send({
        email: 'jane@example.com',
        password: 'Password1',
        firstName: 'Jane',
        lastName: 'Doe',
      });

    return res.body.data.token as string;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with the authenticated user when a valid token is provided', async () => {
    const token = await getValidToken();

    // Mock the DB lookup that getMe() performs
    mockUserFindUnique.mockResolvedValueOnce(buildUser());

    const res = await request(app)
      .get(`${BASE}/auth/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get(`${BASE}/auth/me`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when an invalid token is provided', async () => {
    const res = await request(app)
      .get(`${BASE}/auth/me`)
      .set('Authorization', 'Bearer this.is.not.a.valid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('returns 401 when the Authorization header is malformed (no Bearer prefix)', async () => {
    const token = await getValidToken();
    mockUserFindUnique.mockResolvedValueOnce(buildUser());

    const res = await request(app)
      .get(`${BASE}/auth/me`)
      .set('Authorization', token); // missing "Bearer " prefix

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
