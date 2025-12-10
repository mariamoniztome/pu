import { Request, Response } from 'express';
import Payment from '../models/Payment.js';
import fs from 'fs';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('patient', 'firstName lastName')
      .populate('consultation')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('consultation')
      .populate('appointment');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payment', message: error.message });
  }
};

export const getPaymentsByPatient = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ patient: req.params.patientId })
      .populate('consultation')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;

    if (req.file) {
      paymentData.receiptAttachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedAt: new Date(),
      };
    }

    const payment = new Payment(paymentData);
    await payment.save();
    await payment.populate('patient', 'firstName lastName email phone');
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create payment', message: error.message });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;

    if (req.file) {
      const existingPayment = await Payment.findById(req.params.id);
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
        path: req.file.path,
        uploadedAt: new Date(),
      };
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName email phone');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update payment', message: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
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

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete payment', message: error.message });
  }
};

export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await Payment.aggregate([
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
    res.status(500).json({ error: 'Failed to fetch payment stats', message: error.message });
  }
};
