import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import Organization from '../models/Organization.js';
import { effectivePermissions, PermissionKey } from '../utils/permissions.js';

// Extend Express Request type to include doctor and organization
declare global {
  namespace Express {
    interface Request {
      doctor?: any;
      organization?: any;
    }
  }
}

export interface JwtPayload {
  doctorId: string;
  organizationId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: req.t('jwt.noTokenProvided') });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Get doctor from database
    const doctor = await Doctor.findById(decoded.doctorId).select('-password');
    if (!doctor || !doctor.isActive) {
      res.status(401).json({ message: req.t('common.doctorNotFound') });
      return;
    }

    // Get organization
    const organization = await Organization.findById(decoded.organizationId);
    if (!organization || !organization.isActive) {
      res.status(401).json({ message: req.t('common.organizationNotFoundOrInactive') });
      return;
    }

    // Check subscription status
    if (organization.subscription.status !== 'active') {
      res.status(403).json({
        message: req.t('auth.subscriptionInactiveDetailed'),
        subscriptionStatus: organization.subscription.status
      });
      return;
    }

    // Attach to request
    req.doctor = doctor;
    req.organization = organization;

    // Update last login, throttled — this used to be a full doctor.save() on
    // every authenticated request, which also re-ran the permissions-forcing
    // save hook and made revoking a baseline permission impossible.
    const staleThresholdMs = 15 * 60 * 1000;
    if (!doctor.lastLogin || Date.now() - doctor.lastLogin.getTime() > staleThresholdMs) {
      await Doctor.updateOne({ _id: doctor._id }, { $set: { lastLogin: new Date() } });
    }

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: req.t('jwt.invalidToken') });
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: req.t('jwt.tokenExpired') });
      return;
    }
    res.status(500).json({ message: req.t('jwt.authenticationError'), error: error.message });
  }
};

export const requirePermission = (permission: PermissionKey) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.doctor) {
      res.status(401).json({ message: req.t('common.notAuthenticated') });
      return;
    }

    if (!effectivePermissions(req.doctor)[permission]) {
      res.status(403).json({ message: req.t('common.insufficientPermissions') });
      return;
    }

    next();
  };
};

export const requireOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.doctor) {
    res.status(401).json({ message: req.t('common.notAuthenticated') });
    return;
  }

  if (req.doctor.role !== 'owner') {
    res.status(403).json({ message: req.t('jwt.onlyOwnersCanPerformAction') });
    return;
  }

  next();
};

export const generateToken = (doctor: any, organization: any): string => {
  const payload: JwtPayload = {
    doctorId: doctor._id.toString(),
    organizationId: organization._id.toString(),
    email: doctor.email,
    role: doctor.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};
