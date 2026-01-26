import { Request, Response } from 'express';
import ExternalReport from '../models/ExternalReport.js';
import {
  addOrganizationContext,
  buildOrganizationFilter,
  sanitizeUpdateData,
} from '../utils/multiTenancy.js';
import fs from 'fs';

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req);
    const reports = await ExternalReport.find(filter)
      .populate('patient', 'firstName lastName')
      .sort({ requestDate: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const report = await ExternalReport.findOne(filter)
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
    const filter = buildOrganizationFilter(req, { patient: req.params.patientId });
    const reports = await ExternalReport.find(filter)
      .sort({ requestDate: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const { attachments, ...reportData } = req.body;
    const reportDataWithContext = addOrganizationContext(req, reportData);

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      reportDataWithContext.attachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
      }));
    } else {
      reportDataWithContext.attachments = [];
    }

    const report = new ExternalReport(reportDataWithContext);
    await report.save();
    await report.populate('patient', 'firstName lastName email phone');
    res.status(201).json(report);
  } catch (error: any) {
    console.error('Failed to create report:', error.message);
    res.status(400).json({ error: 'Failed to create report', message: error.message });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { attachments, ...reportData } = req.body;
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const sanitizedData = sanitizeUpdateData(reportData);

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newAttachments = req.files.map((file: Express.Multer.File) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
      }));

      const existingReport = await ExternalReport.findOne(filter);
      if (existingReport) {
        sanitizedData.attachments = [
          ...(existingReport.attachments || []),
          ...newAttachments,
        ];
      } else {
        sanitizedData.attachments = newAttachments;
      }
    }

    const report = await ExternalReport.findOneAndUpdate(
      filter,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error: any) {
    console.error('Failed to update report:', error.message);
    res.status(400).json({ error: 'Failed to update report', message: error.message });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const report = await ExternalReport.findOne(filter);
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

    await ExternalReport.findOneAndDelete(filter);
    res.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete report', message: error.message });
  }
};

export const deleteReportAttachment = async (req: Request, res: Response) => {
  try {
    const { id, filename } = req.params;
    const filter = buildOrganizationFilter(req, { _id: id });
    const report = await ExternalReport.findOne(filter);

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
