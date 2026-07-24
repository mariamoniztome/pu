/**
 * Database Initialization Script
 * 
 * Este script faz tudo: limpa a BD, cria organização/doctor e users de teste
 * 
 * Uso:
 * npx tsx src/scripts/initDb.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Organization from '../models/Organization';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Consultation from '../models/Consultation';
import Payment from '../models/Payment';
import ExternalReport from '../models/ExternalReport';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology-clinic';

// Tipos de users para criar
const testUsers = [
  {
    organizationName: 'Demo Psychology Clinic',
    organizationEmail: 'demo@clinic.com',
    organizationType: 'clinic' as const,
    doctor: {
      firstName: 'Demo',
      lastName: 'Doctor',
      email: 'demo@clinic.com',
      password: 'Demo123456',
      specialization: 'Clinical Psychology',
      role: 'owner' as const,
    },
    createSampleData: true, // Flag para criar dados de amostra
  },
  {
    organizationName: 'Test Clinic Owner',
    organizationEmail: 'org-owner@clinic.test.com',
    organizationType: 'clinic' as const,
    doctor: {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.owner@test.com',
      password: 'Owner123456',
      specialization: 'Clinical Psychology',
      role: 'owner' as const,
    },
    createSampleData: true,
  },
  {
    organizationName: 'Test Clinic Admin',
    organizationEmail: 'org-admin@clinic.test.com',
    organizationType: 'clinic' as const,
    doctor: {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.admin@test.com',
      password: 'Admin123456',
      specialization: 'Neuropsychology',
      role: 'admin' as const,
    },
    createSampleData: true,
  },
  {
    organizationName: 'Solo Psychology Practice',
    organizationEmail: 'org-solo@clinic.test.com',
    organizationType: 'individual' as const,
    doctor: {
      firstName: 'Pedro',
      lastName: 'Costa',
      email: 'pedro.solo@test.com',
      password: 'Solo123456',
      specialization: 'Cognitive Psychology',
      role: 'owner' as const,
    },
    createSampleData: true,
  },
  {
    organizationName: 'Multi Doctor Wellness Clinic',
    organizationEmail: 'org-multi@clinic.test.com',
    organizationType: 'clinic' as const,
    doctor: {
      firstName: 'Ana',
      lastName: 'Oliveira',
      email: 'ana.member@test.com',
      password: 'Member123456',
      specialization: 'Child Psychology',
      role: 'member' as const,
    },
    createSampleData: true,
  },
];

async function createSampleData(organization: any, doctor: any) {
  // Criar 3 patients de amostra
  const patients = await Patient.create([
    {
      organization: organization._id,
      doctor: doctor._id,
      firstName: 'João',
      lastName: 'Silva',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      email: 'joao.silva@email.com',
      phone: '912345678',
      address: 'Rua A, Lisboa',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      firstName: 'Maria',
      lastName: 'Santos',
      dateOfBirth: new Date('1985-08-22'),
      gender: 'female',
      email: 'maria.santos@email.com',
      phone: '912345679',
      address: 'Rua B, Porto',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      firstName: 'Pedro',
      lastName: 'Costa',
      dateOfBirth: new Date('1992-03-10'),
      gender: 'male',
      email: 'pedro.costa@email.com',
      phone: '912345680',
      address: 'Rua C, Covilhã',
    },
  ]);

  // Criar 3 appointments
  await Appointment.create([
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[0]._id,
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias depois
      duration: 60,
      type: 'initial',
      status: 'scheduled',
      notes: 'Consulta inicial',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[1]._id,
      dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 dias depois
      duration: 45,
      type: 'follow-up',
      status: 'scheduled',
      notes: 'Seguimento',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[2]._id,
      dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
      duration: 60,
      type: 'assessment',
      status: 'completed',
      notes: 'Avaliação completa',
    },
  ]);

  // Criar 2 consultations
  await Consultation.create([
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[0]._id,
      date: new Date(),
      sessionNumber: 1,
      chiefComplaint: 'Ansiedade generalizada',
      sessionNotes: 'Primeira sessão de avaliação. Paciente apresenta sintomas de ansiedade.',
      clinicalObservations: 'Paciente colaborativo, bem orientado.',
      interventions: 'Técnicas de relaxamento e psicoeducação',
      homework: 'Exercícios de respiração diários',
      progressAssessment: 'Boa resposta inicial',
      nextSessionPlan: 'Continuar com intervenção psicoterapêutica',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[1]._id,
      date: new Date(),
      sessionNumber: 5,
      chiefComplaint: 'Depressão',
      sessionNotes: 'Seguimento da terapia. Paciente relata melhora nos sintomas.',
      clinicalObservations: 'Humor melhorado, maior engajamento',
      interventions: 'Terapia cognitivo-comportamental',
      homework: 'Diário de pensamentos automáticos',
      progressAssessment: 'Progresso significativo',
      nextSessionPlan: 'Manter frequência semanal',
    },
  ]);

  // Criar 1 external report
  await ExternalReport.create({
    organization: organization._id,
    doctor: doctor._id,
    patient: patients[0]._id,
    reportType: 'medical',
    recipientName: 'Dr. João Silva',
    recipientOrganization: 'Hospital Central',
    requestDate: new Date(),
    purpose: 'Avaliação psicológica para referência médica',
    summary: 'Paciente apresenta ansiedade generalizada com bom prognóstico',
    findings: 'Ansiedade moderada, sem sintomas psicóticos',
    recommendations: 'Psicoterapia e consideração de farmacoterapia',
    status: 'completed',
  });

  // Criar 3 payments
  await Payment.create([
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[0]._id,
      amount: 80,
      currency: 'EUR',
      paymentDate: new Date(),
      paymentMethod: 'card',
      status: 'paid',
      amountPaid: 80,
      invoiceNumber: 'INV-2024-001',
      notes: 'Consulta - 15/01/2024',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[1]._id,
      amount: 80,
      currency: 'EUR',
      paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      paymentMethod: 'transfer',
      status: 'paid',
      amountPaid: 80,
      invoiceNumber: 'INV-2024-002',
      notes: 'Consulta - 08/01/2024',
    },
    {
      organization: organization._id,
      doctor: doctor._id,
      patient: patients[2]._id,
      amount: 100,
      currency: 'EUR',
      paymentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      paymentMethod: 'card',
      status: 'paid',
      amountPaid: 100,
      invoiceNumber: 'INV-2024-003',
      notes: 'Avaliação completa - 01/01/2024',
    },
  ]);
}

async function initializeDatabase() {
  try {
    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Limpar collections
    console.log('🧹 Clearing existing data...');
    const collections = [
      'organizations',
      'doctors',
      'patients',
      'appointments',
      'consultations',
      'payments',
      'externalreports',
      'conversations',
    ];

    for (const collectionName of collections) {
      try {
        await mongoose.connection.collection(collectionName).drop();
      } catch (e) {
        // Collection doesn't exist, skip
      }
    }
    console.log('✅ Cleared existing data\n');

    const createdUsers: any[] = [];

    // Criar users
    for (const testUser of testUsers) {
      console.log(`📋 Creating: ${testUser.organizationName}`);
      console.log('─'.repeat(60));

      // 1. Create organization
      const organization = await Organization.create({
        name: testUser.organizationName,
        type: testUser.organizationType,
        email: testUser.organizationEmail,
        phone: '+351-912345678',
        subscription: {
          plan: 'professional',
          status: 'active',
          maxDoctors: 10,
          maxPatients: 1000,
          startDate: new Date(),
        },
        settings: {
          allowDataSharing: testUser.organizationType === 'clinic',
          timezone: 'Europe/Lisbon',
          language: 'pt-PT',
          dateFormat: 'DD/MM/YYYY',
          currency: 'EUR',
        }
      });

      console.log(`✅ Organization Created: ${organization.name}`);

      // 2. Create doctor
      const doctor = await Doctor.create({
        organization: organization._id,
        ...testUser.doctor,
      });

      console.log(`✅ Doctor Created: ${doctor.firstName} ${doctor.lastName}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Password: ${testUser.doctor.password}`);
      console.log(`   Role: ${doctor.role}`);

      // 3. Create sample data if flag is set
      if (testUser.createSampleData) {
        console.log('\n📊 Creating sample data...');
        await createSampleData(organization, doctor);
        console.log('✅ Sample data created (3 patients, 3 appointments, 2 consultations, 1 report, 3 payments)');
      }

      console.log();

      createdUsers.push({
        organization: organization.name,
        email: doctor.email,
        password: testUser.doctor.password,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        role: doctor.role,
        organizationType: testUser.organizationType,
      });
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('\n✅ DATABASE INITIALIZED SUCCESSFULLY!\n');
    console.log('📋 TEST CREDENTIALS:\n');

    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   🏢 Organization: ${user.organization}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Password: ${user.password}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log('');
    });

    console.log('═'.repeat(60));
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Open: http://localhost:5173');
    console.log('4. Login with any credentials above\n');

    console.log('👑 OWNER:');
    console.log('   - Manage organization');
    console.log('   - Invite/manage doctors');
    console.log('   - View all patients\n');

    console.log('🔧 ADMIN:');
    console.log('   - Invite/manage doctors');
    console.log('   - View all patients\n');

    console.log('👨 MEMBER:');
    console.log('   - View only own patients');
    console.log('   - Cannot manage doctors\n');

    console.log('═'.repeat(60) + '\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

initializeDatabase();
