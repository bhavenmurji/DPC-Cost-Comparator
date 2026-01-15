import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environment as config } from '../config/environment';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401, 'AUTH_TOKEN_MISSING');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;

    // Attach user to request
    req.user = decoded;

    // Log access for audit trail
    logger.debug('User authenticated', {
      userId: decoded.id,
      email: decoded.email,
      path: req.path,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid authentication token', 401, 'AUTH_TOKEN_INVALID'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Authentication token expired', 401, 'AUTH_TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

export const requireEmailVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  if (!req.user.emailVerified) {
    throw new AppError('Email verification required', 403, 'EMAIL_NOT_VERIFIED');
  }

  next();
};

export const refreshTokenAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401, 'REFRESH_TOKEN_MISSING');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as AuthUser;

    // Attach decoded token to request for controller to use
    (req as any).refreshTokenPayload = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401, 'REFRESH_TOKEN_INVALID'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

export const generateAccessToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'dpc-comparator',
      audience: 'dpc-comparator-api',
    }
  );
};

export const generateRefreshToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'dpc-comparator',
      audience: 'dpc-comparator-api',
    }
  );
};

export const generateTokenPair = (user: AuthUser): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
