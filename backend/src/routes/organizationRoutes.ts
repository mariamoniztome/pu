import express, { Request, Response } from 'express';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { authenticate, authorizeOrganization, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Obter detalhes da organização
router.get(
  '/:orgId',
  authenticate,
  authorizeOrganization,
  async (req: any, res: Response) => {
    try {
      const organization = await Organization.findById(req.organizationId)
        .populate('owner', 'name email')
        .populate('members.user', 'name email specialty');

      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Atualizar organização
router.put(
  '/:orgId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin'),
  async (req: any, res: Response) => {
    try {
      const organization = await Organization.findByIdAndUpdate(req.organizationId, req.body, {
        new: true,
        runValidators: true,
      });

      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Adicionar membro à organização
router.post(
  '/:orgId/members',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin'),
  async (req: any, res: Response) => {
    try {
      const { email, role } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado' });
      }

      const organization = await Organization.findById(req.organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organização não encontrada' });
      }

      // Verificar se já é membro
      const isMember = organization.members.some((m: any) => m.user.toString() === user._id.toString());
      if (isMember) {
        return res.status(400).json({ error: 'Utilizador já é membro da organização' });
      }

      organization.members.push({ user: user._id, role });
      await organization.save();

      // Adicionar organização ao utilizador
      user.organizations.push({ organizationId: organization._id, role });
      await user.save();

      res.status(201).json({ message: 'Membro adicionado com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Remover membro da organização
router.delete(
  '/:orgId/members/:userId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin'),
  async (req: any, res: Response) => {
    try {
      await Organization.findByIdAndUpdate(req.organizationId, {
        $pull: { members: { user: req.params.userId } },
      });

      await User.findByIdAndUpdate(req.params.userId, {
        $pull: { organizations: { organizationId: req.organizationId } },
      });

      res.json({ message: 'Membro removido com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;