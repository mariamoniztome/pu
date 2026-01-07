import express, { Request, Response } from 'express';
import Client from '../models/Client.js';
import { authenticate, authorizeOrganization, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Listar clientes da organização
router.get(
  '/:orgId/clients',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const clients = await Client.find({ organizationId: req.organizationId })
        .populate('assignedTherapist', 'name email')
        .sort({ createdAt: -1 });

      res.json(clients);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Obter cliente específico
router.get(
  '/:orgId/clients/:clientId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const client = await Client.findOne({
        _id: req.params.clientId,
        organizationId: req.organizationId,
      }).populate('assignedTherapist');

      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Criar novo cliente
router.post(
  '/:orgId/clients',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const client = new Client({
        organizationId: req.organizationId,
        ...req.body,
      });
      await client.save();

      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Atualizar cliente
router.put(
  '/:orgId/clients/:clientId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const client = await Client.findOneAndUpdate(
        { _id: req.params.clientId, organizationId: req.organizationId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(client);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Eliminar cliente
router.delete(
  '/:orgId/clients/:clientId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin'),
  async (req: any, res: Response) => {
    try {
      const client = await Client.findOneAndDelete({
        _id: req.params.clientId,
        organizationId: req.organizationId,
      });

      if (!client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente eliminado com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;