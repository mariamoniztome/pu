import { Request, Response } from 'express';
import Payment from '../models/Payment.js';
import {
  addOrganizationContext,
  buildOrganizationFilter,
  sanitizeUpdateData,
} from '../utils/multiTenancy.js';
import fs from 'fs';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req);
    const payments = await Payment.find(filter)
      .populate('patient', 'firstName lastName')
      .populate('consultation')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: req.t('payments.fetchFailed'), error: error.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const payment = await Payment.findOne(filter)
      .populate('patient', 'firstName lastName email phone')
      .populate('consultation')
      .populate('appointment');
    if (!payment) {
      return res.status(404).json({ message: req.t('payments.notFound') });
    }
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ message: req.t('payments.fetchOneFailed'), error: error.message });
  }
};

export const getPaymentsByPatient = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { patient: req.params.patientId });
    const payments = await Payment.find(filter)
      .populate('consultation')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: req.t('payments.fetchFailed'), error: error.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = addOrganizationContext(req, req.body);

    console.log('=== CREATE PAYMENT ===');
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);

    if (req.file) {
      console.log('File received:', req.file.filename, req.file.path);
      paymentData.receiptAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path.replace(/\\/g, '/'),
        uploadedAt: new Date(),
      };
      console.log('Receipt attachment set:', paymentData.receiptAttachment);
    } else {
      console.log('No file received');
    }

    const payment = new Payment(paymentData);
    await payment.save();
    await payment.populate('patient', 'firstName lastName email phone');
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ message: req.t('payments.createFailed'), error: error.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const paymentData = sanitizeUpdateData(req.body);

    if (req.file) {
      const existingPayment = await Payment.findOne(filter);
      if (existingPayment?.receiptAttachment) {
        try {
          if (fs.existsSync(existingPayment.receiptAttachment.path)) {
            fs.unlinkSync(existingPayment.receiptAttachment.path);
          }
        } catch (err) {
          console.error('Failed to delete old receipt:', err);
        }
      }

      paymentData.receiptAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path.replace(/\\/g, '/'),
        uploadedAt: new Date(),
      };
    }

    const payment = await Payment.findOneAndUpdate(
      filter,
      paymentData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!payment) {
      return res.status(404).json({ message: req.t('payments.notFound') });
    }
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: req.t('payments.updateFailed'), error: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req, { _id: req.params.id });
    const payment = await Payment.findOne(filter);
    if (!payment) {
      return res.status(404).json({ message: req.t('payments.notFound') });
    }

    if (payment.receiptAttachment) {
      try {
        if (fs.existsSync(payment.receiptAttachment.path)) {
          fs.unlinkSync(payment.receiptAttachment.path);
        }
      } catch (err) {
        console.error('Failed to delete receipt file:', err);
      }
    }

    await Payment.findOneAndDelete(filter);
    res.json({ message: req.t('payments.deletedSuccessfully') });
  } catch (error: any) {
    res.status(500).json({ message: req.t('payments.deleteFailed'), error: error.message });
  }
};

export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const filter = buildOrganizationFilter(req);
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$amountPaid' },
        },
      },
    ]);

    const formattedStats = {
      unpaid: { count: 0, totalAmount: 0, totalPaid: 0 },
      partial: { count: 0, totalAmount: 0, totalPaid: 0 },
      paid: { count: 0, totalAmount: 0, totalPaid: 0 },
    };

    stats.forEach((stat) => {
      if (stat._id in formattedStats) {
        formattedStats[stat._id as keyof typeof formattedStats] = {
          count: stat.count,
          totalAmount: stat.totalAmount,
          totalPaid: stat.totalPaid,
        };
      }
    });

    res.json(formattedStats);
  } catch (error: any) {
    res.status(500).json({ message: req.t('payments.statsFailed'), error: error.message });
  }
};
