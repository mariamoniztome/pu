import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

export interface AuthRequest extends Request {
  user?: any;
  organization?: any;
  organizationId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.id).populate('organizations.organizationId');

    if (!user) {
      return res.status(401).json({ error: 'Utilizador não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const authorizeOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;

    const orgAccess = req.user.organizations.find(
      (org: any) => org.organizationId._id.toString() === orgId
    );

    if (!orgAccess) {
      return res.status(403).json({ error: 'Sem acesso a esta organização' });
    }

    req.organization = orgAccess;
    req.organizationId = orgId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Acesso negado' });
  }
};

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.organization?.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }
    next();
  };
};