import { Request, Response } from 'express';
import Appointment from '../models/Appointment.js';

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointments', message: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
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
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch appointments', message: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    await appointment.populate('patient', 'firstName lastName email phone');
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create appointment', message: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
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
    const appointments = await Appointment.find({
      dateTime: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] },
    })
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: 1 })
      .limit(20);
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch upcoming appointments', message: error.message });
  }
};
