/**
 * Unit tests for Zod validation schemas
 *
 * These tests exercise the schema layer directly — no HTTP transport or
 * database involvement.  They verify that:
 *   • Valid inputs are accepted and shaped correctly (coercion, defaults).
 *   • Invalid inputs produce structured ZodError messages.
 */

import { z } from 'zod';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../modules/auth/auth.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a schema and expect success; returns the parsed value. */
function expectValid<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Expected valid input but got errors: ${JSON.stringify(result.error.issues)}`);
  }
  return result.data;
}

/** Parse a schema and expect a ZodError; returns the issues. */
function expectInvalid(schema: z.ZodSchema, input: unknown): z.ZodIssue[] {
  const result = schema.safeParse(input);
  if (result.success) {
    throw new Error('Expected invalid input but parsing succeeded.');
  }
  return result.error.issues;
}

/** Return true if any issue targets a specific path segment. */
function hasIssueOnPath(issues: z.ZodIssue[], key: string): boolean {
  return issues.some((i) => i.path.includes(key));
}

// ===========================================================================
// RegisterSchema
// ===========================================================================

describe('RegisterSchema', () => {
  const validInput = {
    email: 'Jane@Example.COM',
    password: 'SecurePass1',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  // ── Valid inputs ─────────────────────────────────────────────────────────

  describe('valid inputs', () => {
    it('accepts a well-formed registration payload', () => {
      const result = expectValid(RegisterSchema, validInput);
      expect(result.email).toBe('jane@example.com'); // lowercased
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe');
    });

    it('coerces email to lowercase', () => {
      const result = expectValid(RegisterSchema, { ...validInput, email: 'UPPER@EXAMPLE.COM' });
      expect(result.email).toBe('upper@example.com');
    });

    it('defaults role to CLIENT when omitted', () => {
      const result = expectValid(RegisterSchema, validInput);
      expect(result.role).toBe('CLIENT');
    });

    it('accepts role CLIENT explicitly', () => {
      const result = expectValid(RegisterSchema, { ...validInput, role: 'CLIENT' });
      expect(result.role).toBe('CLIENT');
    });

    it('accepts role TRAINER', () => {
      const result = expectValid(RegisterSchema, { ...validInput, role: 'TRAINER' });
      expect(result.role).toBe('TRAINER');
    });

    it('accepts a password that is exactly 8 characters with uppercase and digit', () => {
      const result = expectValid(RegisterSchema, { ...validInput, password: 'Passw0rd' });
      expect(result.password).toBe('Passw0rd');
    });

    it('accepts firstName up to 50 characters', () => {
      const result = expectValid(RegisterSchema, {
        ...validInput,
        firstName: 'A'.repeat(50),
      });
      expect(result.firstName).toHaveLength(50);
    });
  });

  // ── Invalid email ─────────────────────────────────────────────────────────

  describe('email validation', () => {
    it('rejects a missing email', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, email: undefined });
      expect(hasIssueOnPath(issues, 'email')).toBe(true);
    });

    it('rejects a plain string that is not an email', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, email: 'not-an-email' });
      expect(hasIssueOnPath(issues, 'email')).toBe(true);
    });

    it('rejects an email without a domain', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, email: 'user@' });
      expect(hasIssueOnPath(issues, 'email')).toBe(true);
    });
  });

  // ── Invalid password ──────────────────────────────────────────────────────

  describe('password validation', () => {
    it('rejects a password shorter than 8 characters', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, password: 'Ab1' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects a password with no uppercase letter', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, password: 'nouppercase1' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects a password with no digit', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, password: 'NoDigitHere' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects an empty password', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, password: '' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects a missing password', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, password: undefined });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });
  });

  // ── Name fields ───────────────────────────────────────────────────────────

  describe('name field validation', () => {
    it('rejects an empty firstName', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, firstName: '' });
      expect(hasIssueOnPath(issues, 'firstName')).toBe(true);
    });

    it('rejects a firstName longer than 50 characters', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, firstName: 'A'.repeat(51) });
      expect(hasIssueOnPath(issues, 'firstName')).toBe(true);
    });

    it('rejects an empty lastName', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, lastName: '' });
      expect(hasIssueOnPath(issues, 'lastName')).toBe(true);
    });
  });

  // ── Role enum ─────────────────────────────────────────────────────────────

  describe('role validation', () => {
    it('rejects an unknown role value', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, role: 'ADMIN' });
      expect(hasIssueOnPath(issues, 'role')).toBe(true);
    });

    it('rejects a lowercase role string', () => {
      const issues = expectInvalid(RegisterSchema, { ...validInput, role: 'client' });
      expect(hasIssueOnPath(issues, 'role')).toBe(true);
    });
  });
});

// ===========================================================================
// LoginSchema
// ===========================================================================

describe('LoginSchema', () => {
  const validInput = {
    email: 'Jane@Example.COM',
    password: 'Password1',
  };

  describe('valid inputs', () => {
    it('accepts valid email and password', () => {
      const result = expectValid(LoginSchema, validInput);
      expect(result.email).toBe('jane@example.com');
      expect(result.password).toBe('Password1');
    });

    it('coerces email to lowercase', () => {
      const result = expectValid(LoginSchema, { ...validInput, email: 'UPPER@EXAMPLE.COM' });
      expect(result.email).toBe('upper@example.com');
    });
  });

  describe('invalid inputs', () => {
    it('rejects a missing email', () => {
      const issues = expectInvalid(LoginSchema, { password: 'Password1' });
      expect(hasIssueOnPath(issues, 'email')).toBe(true);
    });

    it('rejects an invalid email format', () => {
      const issues = expectInvalid(LoginSchema, { ...validInput, email: 'not-email' });
      expect(hasIssueOnPath(issues, 'email')).toBe(true);
    });

    it('rejects a missing password', () => {
      const issues = expectInvalid(LoginSchema, { email: 'jane@example.com' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects an empty password', () => {
      const issues = expectInvalid(LoginSchema, { ...validInput, password: '' });
      expect(hasIssueOnPath(issues, 'password')).toBe(true);
    });

    it('rejects a completely empty payload', () => {
      const issues = expectInvalid(LoginSchema, {});
      expect(issues.length).toBeGreaterThan(0);
    });
  });
});

// ===========================================================================
// RefreshTokenSchema
// ===========================================================================

describe('RefreshTokenSchema', () => {
  describe('valid inputs', () => {
    it('accepts a non-empty refresh token string', () => {
      const result = expectValid(RefreshTokenSchema, { refreshToken: 'a.b.c' });
      expect(result.refreshToken).toBe('a.b.c');
    });

    it('accepts a long token string', () => {
      const longToken = 'x'.repeat(512);
      const result = expectValid(RefreshTokenSchema, { refreshToken: longToken });
      expect(result.refreshToken).toHaveLength(512);
    });
  });

  describe('invalid inputs', () => {
    it('rejects a missing refreshToken field', () => {
      const issues = expectInvalid(RefreshTokenSchema, {});
      expect(hasIssueOnPath(issues, 'refreshToken')).toBe(true);
    });

    it('rejects an empty string refreshToken', () => {
      const issues = expectInvalid(RefreshTokenSchema, { refreshToken: '' });
      expect(hasIssueOnPath(issues, 'refreshToken')).toBe(true);
    });

    it('rejects a null refreshToken', () => {
      const issues = expectInvalid(RefreshTokenSchema, { refreshToken: null });
      expect(hasIssueOnPath(issues, 'refreshToken')).toBe(true);
    });
  });
});

// ===========================================================================
// Cross-schema: email normalisation consistency
// ===========================================================================

describe('Email normalisation (cross-schema)', () => {
  it('RegisterSchema and LoginSchema both lowercase the email identically', () => {
    const rawEmail = 'Alice@EXAMPLE.COM';

    const regResult = expectValid(RegisterSchema, {
      email: rawEmail,
      password: 'Password1',
      firstName: 'Alice',
      lastName: 'Smith',
    });

    const loginResult = expectValid(LoginSchema, {
      email: rawEmail,
      password: 'Password1',
    });

    expect(regResult.email).toBe(loginResult.email);
    expect(regResult.email).toBe('alice@example.com');
  });
});
