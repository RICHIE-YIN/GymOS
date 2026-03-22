/**
 * Integration tests for the Workout Sessions module
 *
 * Endpoints covered:
 *   POST /api/v1/sessions/start             – start a new session
 *   POST /api/v1/sessions/:id/log-set       – log a set within a session
 *   POST /api/v1/sessions/:id/finish        – mark a session as complete
 *   GET  /api/v1/me/sessions/history        – retrieve session history
 *
 * PrismaClient is mocked — no database connection is required.
 * A valid JWT is generated directly via the jwt lib so no login round-trip is needed.
 */

import request from 'supertest';
import app from '../index';
import { generateToken } from '../lib/jwt';

// ---------------------------------------------------------------------------
// Mock PrismaClient
// ---------------------------------------------------------------------------

jest.mock('../lib/prisma', () => {
  const mockPrisma = {
    workoutSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    workoutSetLog: {
      create: jest.fn(),
    },
    exercise: {
      findUnique: jest.fn(),
    },
  };
  return { __esModule: true, default: mockPrisma };
});

import prisma from '../lib/prisma';

const mockSessionCreate = prisma.workoutSession.create as jest.Mock;
const mockSessionFindFirst = prisma.workoutSession.findFirst as jest.Mock;
const mockSessionFindUnique = prisma.workoutSession.findUnique as jest.Mock;
const mockSessionUpdate = prisma.workoutSession.update as jest.Mock;
const mockSessionFindMany = prisma.workoutSession.findMany as jest.Mock;
const mockSetLogCreate = prisma.workoutSetLog.create as jest.Mock;
const mockExerciseFindUnique = prisma.exercise.findUnique as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = '/api/v1';
const TEST_USER_ID = 'user_cuid_session_test';

function makeAuthToken(role = 'CLIENT'): string {
  return generateToken({
    userId: TEST_USER_ID,
    email: 'session-tester@example.com',
    role,
  });
}

function buildSession(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'session_cuid_001',
    userId: TEST_USER_ID,
    workoutDayId: null,
    startedAt: new Date('2024-06-01T09:00:00.000Z'),
    endedAt: null,
    completed: false,
    durationMinutes: null,
    notes: null,
    setLogs: [],
    ...overrides,
  };
}

function buildSetLog(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'setlog_cuid_001',
    sessionId: 'session_cuid_001',
    exerciseId: 'exercise_cuid_001',
    setNumber: 1,
    actualWeightKg: 100,
    actualReps: 5,
    actualRpe: 8,
    completed: true,
    notes: null,
    ...overrides,
  };
}

function buildExercise() {
  return {
    id: 'exercise_cuid_001',
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    isActive: true,
  };
}

// ---------------------------------------------------------------------------
// POST /api/v1/sessions/start
// ---------------------------------------------------------------------------

describe('POST /api/v1/sessions/start', () => {
  const token = makeAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with a new session on success (no workoutDayId)', async () => {
    mockSessionCreate.mockResolvedValue(buildSession());

    const res = await request(app)
      .post(`${BASE}/sessions/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session).toHaveProperty('id');
    expect(res.body.data.session.completed).toBe(false);
    expect(res.body.data.session.userId).toBe(TEST_USER_ID);
  });

  it('returns 201 with a session linked to a workout day', async () => {
    const session = buildSession({ workoutDayId: 'day_cuid_001' });
    mockSessionCreate.mockResolvedValue(session);

    const res = await request(app)
      .post(`${BASE}/sessions/start`)
      .set('Authorization', `Bearer ${token}`)
      .send({ workoutDayId: 'day_cuid_001' });

    expect(res.status).toBe(201);
    expect(res.body.data.session.workoutDayId).toBe('day_cuid_001');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`${BASE}/sessions/start`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/sessions/:id/log-set
// ---------------------------------------------------------------------------

describe('POST /api/v1/sessions/:id/log-set', () => {
  const token = makeAuthToken();
  const SESSION_ID = 'session_cuid_001';

  const validSetPayload = {
    exerciseId: 'exercise_cuid_001',
    setNumber: 1,
    actualReps: 5,
    actualWeightKg: 100,
    actualRpe: 8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with the set log on success', async () => {
    mockSessionFindFirst.mockResolvedValue(buildSession());
    mockExerciseFindUnique.mockResolvedValue(buildExercise());
    mockSetLogCreate.mockResolvedValue(buildSetLog());

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/log-set`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSetPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.setLog).toHaveProperty('id');
    expect(res.body.data.setLog.actualReps).toBe(5);
    expect(res.body.data.setLog.actualWeightKg).toBe(100);
  });

  it('returns 404 when the session does not exist', async () => {
    mockSessionFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/log-set`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSetPayload);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when the session belongs to a different user', async () => {
    // findFirst with userId filter returns null for another user's session
    mockSessionFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/log-set`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSetPayload);

    expect(res.status).toBe(404);
  });

  it('returns 400 when the session is already completed', async () => {
    mockSessionFindFirst.mockResolvedValue(buildSession({ completed: true }));

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/log-set`)
      .set('Authorization', `Bearer ${token}`)
      .send(validSetPayload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/log-set`)
      .send(validSetPayload);

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/sessions/:id/finish
// ---------------------------------------------------------------------------

describe('POST /api/v1/sessions/:id/finish', () => {
  const token = makeAuthToken();
  const SESSION_ID = 'session_cuid_001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with the completed session', async () => {
    const openSession = buildSession();
    const closedSession = buildSession({
      completed: true,
      endedAt: new Date(),
      durationMinutes: 45,
    });

    mockSessionFindFirst.mockResolvedValue(openSession);
    mockSessionUpdate.mockResolvedValue(closedSession);

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'Felt strong today.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.session.completed).toBe(true);
    expect(res.body.data.session.durationMinutes).toBe(45);
  });

  it('returns 404 when the session does not exist', async () => {
    mockSessionFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 when the session is already finished', async () => {
    mockSessionFindFirst.mockResolvedValue(buildSession({ completed: true }));

    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post(`${BASE}/sessions/${SESSION_ID}/finish`)
      .send({});

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/me/sessions/history
// ---------------------------------------------------------------------------

describe('GET /api/v1/me/sessions/history', () => {
  const token = makeAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with an array of past sessions', async () => {
    const sessions = [
      buildSession({ id: 'session_001', completed: true, durationMinutes: 60 }),
      buildSession({ id: 'session_002', completed: true, durationMinutes: 45 }),
    ];

    mockSessionFindMany.mockResolvedValue(sessions);

    const res = await request(app)
      .get(`${BASE}/me/sessions/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.sessions)).toBe(true);
    expect(res.body.data.sessions).toHaveLength(2);
  });

  it('returns an empty array when no sessions exist', async () => {
    mockSessionFindMany.mockResolvedValue([]);

    const res = await request(app)
      .get(`${BASE}/me/sessions/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.sessions).toHaveLength(0);
  });

  it('supports pagination via page and limit query params', async () => {
    mockSessionFindMany.mockResolvedValue([buildSession({ completed: true })]);

    const res = await request(app)
      .get(`${BASE}/me/sessions/history?page=2&limit=10`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Verify pagination params are forwarded (findMany was called)
    expect(mockSessionFindMany).toHaveBeenCalled();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get(`${BASE}/me/sessions/history`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
