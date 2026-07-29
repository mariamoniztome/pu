import { Request, Response } from 'express';
import Consultation from '../models/Consultation.js';
import {
  addOrganizationContext,
  buildOrganizationFilter,
  sanitizeUpdateData,
} from '../utils/multiTenancy.js';
import fs from 'fs';
import path from 'path';

export const getAllConsultations = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req);
    const consultations = await Consultation.find(filter)
      .populate('patient', 'firstName lastName')
      .populate('appointment')
      .sort({ date: -1 });
    res.json(consultations);
  } catch (error: any) {
    res.status(500).json({ message: req.t('consultations.fetchFailed'), error: error.message });
  }
};

export const getConsultationById = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const consultation = await Consultation.findOne(filter)
      .populate('patient', 'firstName lastName email phone')
      .populate('appointment');
    if (!consultation) {
      return res.status(404).json({ message: req.t('consultations.notFound') });
    }
    res.json(consultation);
  } catch (error: any) {
    res.status(500).json({ message: req.t('consultations.fetchOneFailed'), error: error.message });
  }
};

export const getConsultationsByPatient = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { patient: req.params.patientId });
    const consultations = await Consultation.find(filter)
      .populate('appointment')
      .sort({ date: -1 });
    res.json(consultations);
  } catch (error: any) {
    res.status(500).json({ message: req.t('consultations.fetchFailed'), error: error.message });
  }
};

export const createConsultation = async (req: Request, res: Response) => {
  try {
    const consultationData = addOrganizationContext(req, req.body);

    console.log('=== CREATE CONSULTATION ===');
    console.log('Files received:', req.files?.length || 0);
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log('Files:', req.files.map(f => f.filename));
      consultationData.attachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path.replace(/\\/g, '/'),
        uploadedAt: new Date(),
      }));
      console.log('Attachments added:', consultationData.attachments.length);
    } else {
      consultationData.attachments = [];
      console.log('No files received');
    }

    const consultation = new Consultation(consultationData);
    await consultation.save();
    await consultation.populate('patient', 'firstName lastName email phone');
    res.status(201).json(consultation);
  } catch (error: any) {
    res.status(400).json({ message: req.t('consultations.createFailed'), error: error.message });
  }
};

export const updateConsultation = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const consultationData = sanitizeUpdateData(req.body);

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newAttachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path.replace(/\\/g, '/'),
        uploadedAt: new Date(),
      }));

      const existingConsultation = await Consultation.findOne(filter);
      if (existingConsultation) {
        consultationData.attachments = [
          ...(existingConsultation.attachments || []),
          ...newAttachments,
        ];
      } else {
        consultationData.attachments = newAttachments;
      }
    }

    const consultation = await Consultation.findOneAndUpdate(
      filter,
      consultationData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!consultation) {
      return res.status(404).json({ message: req.t('consultations.notFound') });
    }
    res.json(consultation);
  } catch (error: any) {
    res.status(400).json({ message: req.t('consultations.updateFailed'), error: error.message });
  }
};

export const deleteConsultation = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const consultation = await Consultation.findOne(filter);
    if (!consultation) {
      return res.status(404).json({ message: req.t('consultations.notFound') });
    }

    if (consultation.attachments && consultation.attachments.length > 0) {
      consultation.attachments.forEach((attachment) => {
        try {
          if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
          }
        } catch (err) {
          console.error('Failed to delete file:', attachment.path, err);
        }
      });
    }

    await Consultation.findOneAndDelete(filter);
    res.json({ message: req.t('consultations.deletedSuccessfully') });
  } catch (error: any) {
    res.status(500).json({ message: req.t('consultations.deleteFailed'), error: error.message });
  }
};

export const deleteConsultationAttachment = async (req: Request, res: Response) => {
  try {
    const { id, filename } = req.params;
    const filter = buildOrganizationFilter(req, { _id: id });
    const consultation = await Consultation.findOne(filter);

    if (!consultation) {
      return res.status(404).json({ message: req.t('consultations.notFound') });
    }

    const attachmentIndex = consultation.attachments.findIndex(
      (att) => att.filename === filename
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ message: req.t('common.attachmentNotFound') });
    }

    const attachment = consultation.attachments[attachmentIndex];

    try {
      if (fs.existsSync(attachment.path)) {
        fs.unlinkSync(attachment.path);
      }
    } catch (err) {
      console.error('Failed to delete file:', attachment.path, err);
    }

    consultation.attachments.splice(attachmentIndex, 1);
    await consultation.save();

    res.json({ message: req.t('common.attachmentDeletedSuccessfully') });
  } catch (error: any) {
    res.status(500).json({ message: req.t('common.deleteAttachmentFailed'), error: error.message });
  }
};
