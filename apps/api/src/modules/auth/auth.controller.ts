import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { verifyRefreshToken, generateToken } from '../../lib/jwt';
import { AppError } from '../../middleware/error.middleware';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await AuthService.login(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // In a stateless JWT setup, the client discards the token.
    // For production, implement token blacklisting with Redis here.
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }
    const user = await AuthService.getMe(req.user.userId);
    res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 400, 'BAD_REQUEST');
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await AuthService.getMe(payload.userId);

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (err) {
    next(err);
  }
}
