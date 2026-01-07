import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import externalReportRoutes from './routes/externalReportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({
    message: 'Psychology Clinic Management API - Multi-Tenant',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      organizations: '/api/organizations/:orgId',
      clients: '/api/:orgId/clients',
      appointments: '/api/:orgId/appointments',
      consultations: '/api/consultations',
      externalReports: '/api/external-reports',
      payments: '/api/payments',
      chatbot: '/api/chatbot',
    },
  });
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/organizations', organizationRoutes);
app.use('/api', clientRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/external-reports', externalReportRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔐 Multi-Tenant Authentication enabled`);
      console.log('\n✨ Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();