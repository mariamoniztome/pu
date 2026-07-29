import { Request, Response } from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import {
  addOrganizationContext,
  buildOrganizationFilter,
  sanitizeUpdateData,
} from '../utils/multiTenancy.js';

// Calendar visibility is intentionally independent of canViewAllPatients/
// allowDataSharing — being able to see a colleague's schedule is a different
// consent question than being able to read their patients' clinical notes.
// Default (no doctorId) is always "my own appointments"; viewing someone
// else's calendar is an explicit opt-in via ?doctorId=, gated by permission.
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.query;
    const filter: any = { organization: req.organization._id };

    if (doctorId && doctorId !== req.doctor._id.toString()) {
      const canViewAllCalendars =
        req.doctor.role === 'owner' || req.doctor.permissions.canViewAllCalendars;
      if (!canViewAllCalendars) {
        res.status(403).json({ message: req.t('appointments.insufficientPermissionsCalendar') });
        return;
      }

      const targetDoctor = await Doctor.findOne({ _id: doctorId, organization: req.organization._id });
      if (!targetDoctor) {
        res.status(404).json({ message: req.t('common.doctorNotFound') });
        return;
      }

      filter.doctor = doctorId;
    } else {
      filter.doctor = req.doctor._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phone')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: req.t('appointments.fetchFailed'), error: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const appointment = await Appointment.findOne(filter)
      .populate('patient', 'firstName lastName email phone');
    if (!appointment) {
      return res.status(404).json({ message: req.t('appointments.notFound') });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: req.t('appointments.fetchOneFailed'), error: error.message });
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
    res.status(500).json({ message: req.t('appointments.fetchFailed'), error: error.message });
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
    res.status(400).json({ message: req.t('appointments.createFailed'), error: error.message });
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
      return res.status(404).json({ message: req.t('appointments.notFound') });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ message: req.t('appointments.updateFailed'), error: error.message });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const appointment = await Appointment.findOneAndDelete(filter);
    if (!appointment) {
      return res.status(404).json({ message: req.t('appointments.notFound') });
    }
    res.json({ message: req.t('appointments.deletedSuccessfully') });
  } catch (error: any) {
    res.status(500).json({ message: req.t('appointments.deleteFailed'), error: error.message });
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
    res.status(500).json({ message: req.t('appointments.fetchUpcomingFailed'), error: error.message });
  }
};
