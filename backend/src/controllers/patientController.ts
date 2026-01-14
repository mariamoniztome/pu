import { Request, Response } from 'express';
import Patient from '../models/Patient.js';

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    // Filter by organization
    const filter: any = { organization: req.organization._id };
    
    // If organization doesn't allow data sharing, filter by doctor
    if (!req.organization.settings.allowDataSharing) {
      filter.doctor = req.doctor._id;
    } else if (!req.doctor.permissions.canViewAllPatients) {
      // If data sharing is allowed but doctor doesn't have permission, show only their patients
      filter.doctor = req.doctor._id;
    }
    
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch patients', message: error.message });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const filter: any = { 
      _id: req.params.id, 
      organization: req.organization._id 
    };
    
    // If organization doesn't allow data sharing, ensure it's the doctor's patient
    if (!req.organization.settings.allowDataSharing && !req.doctor.permissions.canViewAllPatients) {
      filter.doctor = req.doctor._id;
    }
    
    const patient = await Patient.findOne(filter);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch patient', message: error.message });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    // Add organization and doctor to patient data
    const patientData = {
      ...req.body,
      organization: req.organization._id,
      doctor: req.doctor._id,
    };
    
    const patient = new Patient(patientData);
    await patient.save();
    res.status(201).json(patient);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create patient', message: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const filter: any = { 
      _id: req.params.id, 
      organization: req.organization._id 
    };
    
    // If organization doesn't allow data sharing, ensure it's the doctor's patient
    if (!req.organization.settings.allowDataSharing && !req.doctor.permissions.canViewAllPatients) {
      filter.doctor = req.doctor._id;
    }
    
    // Don't allow changing organization or doctor through this endpoint
    const updateData = { ...req.body };
    delete updateData.organization;
    delete updateData.doctor;
    
    const patient = await Patient.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update patient', message: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const filter: any = { 
      _id: req.params.id, 
      organization: req.organization._id 
    };
    
    // If organization doesn't allow data sharing, ensure it's the doctor's patient
    if (!req.organization.settings.allowDataSharing && !req.doctor.permissions.canViewAllPatients) {
      filter.doctor = req.doctor._id;
    }
    
    const patient = await Patient.findOneAndDelete(filter);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete patient', message: error.message });
  }
};

export const searchPatients = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filter: any = {
      organization: req.organization._id,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    };
    
    // If organization doesn't allow data sharing, filter by doctor
    if (!req.organization.settings.allowDataSharing && !req.doctor.permissions.canViewAllPatients) {
      filter.doctor = req.doctor._id;
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to search patients', message: error.message });
  }
};
