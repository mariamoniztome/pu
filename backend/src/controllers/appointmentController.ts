import { Request, Response } from 'express';
import Appointment from '../models/Appointment.js';
import {
  addOrganizationContext,
  buildOrganizationFilter,
  sanitizeUpdateData,
} from '../utils/multiTenancy.js';

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req);
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointments', message: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const appointment = await Appointment.findOne(filter)
      .populate('patient', 'firstName lastName email phone');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointment', message: error.message });
  }
};

export const getAppointmentsByPatient = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { patient: req.params.patientId });
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointments', message: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentData = addOrganizationContext(req, req.body);
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    await appointment.populate('patient', 'firstName lastName email phone');
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create appointment', message: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const updateData = sanitizeUpdateData(req.body);
    const appointment = await Appointment.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update appointment', message: error.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const appointment = await Appointment.findOneAndDelete(filter);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete appointment', message: error.message });
  }
};

export const getUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const filter = buildOrganizationFilter(req, {
      dateTime: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] },
    });
    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: 1 })
      .limit(20);
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch upcoming appointments', message: error.message });
  }
};
