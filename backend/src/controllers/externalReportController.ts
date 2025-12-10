import { Request, Response } from 'express';
import ExternalReport from '../models/ExternalReport.js';
import fs from 'fs';

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await ExternalReport.find()
      .populate('patient', 'firstName lastName')
      .sort({ requestDate: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await ExternalReport.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch report', message: error.message });
  }
};

export const getReportsByPatient = async (req: Request, res: Response) => {
  try {
    const reports = await ExternalReport.find({ patient: req.params.patientId })
      .sort({ requestDate: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const reportData = req.body;

    if (req.files && Array.isArray(req.files)) {
      reportData.attachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
      }));
    }

    const report = new ExternalReport(reportData);
    await report.save();
    await report.populate('patient', 'firstName lastName email phone');
    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create report', message: error.message });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const reportData = req.body;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newAttachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
      }));

      const existingReport = await ExternalReport.findById(req.params.id);
      if (existingReport) {
        reportData.attachments = [
          ...(existingReport.attachments || []),
          ...newAttachments,
        ];
      } else {
        reportData.attachments = newAttachments;
      }
    }

    const report = await ExternalReport.findByIdAndUpdate(
      req.params.id,
      reportData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update report', message: error.message });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const report = await ExternalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.attachments && report.attachments.length > 0) {
      report.attachments.forEach((attachment) => {
        try {
          if (fs.existsSync(attachment.path)) {
            fs.unlinkSync(attachment.path);
          }
        } catch (err) {
          console.error('Failed to delete file:', attachment.path, err);
        }
      });
    }

    await ExternalReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete report', message: error.message });
  }
};

export const deleteReportAttachment = async (req: Request, res: Response) => {
  try {
    const { id, filename } = req.params;
    const report = await ExternalReport.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const attachmentIndex = report.attachments.findIndex(
      (att) => att.filename === filename
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = report.attachments[attachmentIndex];

    try {
      if (fs.existsSync(attachment.path)) {
        fs.unlinkSync(attachment.path);
      }
    } catch (err) {
      console.error('Failed to delete file:', attachment.path, err);
    }

    report.attachments.splice(attachmentIndex, 1);
    await report.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete attachment', message: error.message });
  }
};
