import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { generateToken, generateRefreshToken } from '../../lib/jwt';
import { env } from '../../config/env';
import { AppError, ConflictError, UnauthorizedError } from '../../middleware/error.middleware';
import { RegisterInput, LoginInput } from './auth.schema';
import { UserRole } from '@prisma/client';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl: string | null;
    isActive: boolean;
    createdAt: Date;
  };
  token: string;
  refreshToken: string;
}

export async function register(data: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: (data.role as UserRole) || 'CLIENT',
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Create default free trial subscription
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      planType: 'FREE',
      status: 'TRIALING',
      provider: 'internal',
      trialEndsAt,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken(user.id);

  return { user, token, refreshToken };
}

export async function login(data: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken(user.id);

  return { user: userWithoutPassword, token, refreshToken };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userProfile: true,
      trainerProfile: true,
      subscription: {
        select: {
          planType: true,
          status: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  return user;
}
