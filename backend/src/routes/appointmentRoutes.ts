import express, { Request, Response } from 'express';
import Appointment from '../models/Appointment.js';
import { authenticate, authorizeOrganization, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Listar agendamentos da organização
router.get(
  '/:orgId/appointments',
  authenticate,
  authorizeOrganization,
  async (req: any, res: Response) => {
    try {
      const { therapist, status, startDate, endDate } = req.query;
      const filter: any = { organizationId: req.organizationId };

      if (therapist) filter.therapist = therapist;
      if (status) filter.status = status;
      if (startDate || endDate) {
        filter.startTime = {};
        if (startDate) filter.startTime.$gte = new Date(startDate);
        if (endDate) filter.startTime.$lte = new Date(endDate);
      }

      const appointments = await Appointment.find(filter)
        .populate('therapist', 'name email')
        .populate('client', 'name email')
        .sort({ startTime: -1 });

      res.json(appointments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Criar agendamento
router.post(
  '/:orgId/appointments',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const appointment = new Appointment({
        organizationId: req.organizationId,
        ...req.body,
      });
      await appointment.save();

      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Atualizar agendamento
router.put(
  '/:orgId/appointments/:appointmentId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin', 'therapist'),
  async (req: any, res: Response) => {
    try {
      const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.appointmentId, organizationId: req.organizationId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Eliminar agendamento
router.delete(
  '/:orgId/appointments/:appointmentId',
  authenticate,
  authorizeOrganization,
  authorizeRole('owner', 'admin'),
  async (req: any, res: Response) => {
    try {
      const appointment = await Appointment.findOneAndDelete({
        _id: req.params.appointmentId,
        organizationId: req.organizationId,
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json({ message: 'Agendamento eliminado com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;