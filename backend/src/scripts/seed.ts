import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import ExternalReport from '../models/ExternalReport.js';
import Payment from '../models/Payment.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology-clinic';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Consultation.deleteMany({});
    await ExternalReport.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');

    console.log('Creating sample patients...');
    const patients = await Patient.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        address: '123 Main St, City, State 12345',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1-555-0102',
        },
        familyNotes: 'Married with two children',
        contextNotes: 'Works as a software engineer, experiencing work-related stress',
      },
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'female',
        email: 'sarah.smith@example.com',
        phone: '+1-555-0201',
        address: '456 Oak Ave, City, State 12345',
        familyNotes: 'Single parent with one child',
        contextNotes: 'Recent divorce, seeking support for anxiety management',
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        dateOfBirth: new Date('2005-03-10'),
        gender: 'male',
        email: 'mjohnson@example.com',
        phone: '+1-555-0301',
        address: '789 Pine Rd, City, State 12345',
        emergencyContact: {
          name: 'Robert Johnson',
          relationship: 'Father',
          phone: '+1-555-0302',
        },
        familyNotes: 'Lives with both parents and younger sibling',
        contextNotes: 'High school student, referred by school counselor for behavioral issues',
      },
    ]);
    console.log(`Created ${patients.length} patients`);

    console.log('Creating sample appointments...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.create([
      {
        patient: patients[0]._id,
        dateTime: tomorrow,
        duration: 60,
        type: 'follow-up',
        status: 'confirmed',
        notes: 'Regular therapy session',
      },
      {
        patient: patients[1]._id,
        dateTime: nextWeek,
        duration: 90,
        type: 'assessment',
        status: 'scheduled',
        notes: 'Comprehensive psychological assessment',
      },
      {
        patient: patients[2]._id,
        dateTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        type: 'initial',
        status: 'completed',
        notes: 'Initial consultation completed',
      },
    ]);
    console.log(`Created ${appointments.length} appointments`);

    console.log('Creating sample consultations...');
    const consultations = await Consultation.create([
      {
        patient: patients[0]._id,
        appointment: appointments[2]._id,
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        sessionNumber: 1,
        chiefComplaint: 'Work-related stress and anxiety',
        sessionNotes: 'Patient reports high levels of stress at work. Discussed coping mechanisms and relaxation techniques.',
        clinicalObservations: 'Patient appears anxious but engaged. Good insight into problems.',
        interventions: 'Taught progressive muscle relaxation. Discussed cognitive restructuring.',
        homework: 'Practice relaxation exercises daily. Keep a thought journal.',
        progressAssessment: 'Good initial engagement. Motivated for change.',
        nextSessionPlan: 'Review homework. Introduce CBT techniques for anxiety management.',
        attachments: [],
      },
      {
        patient: patients[1]._id,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        sessionNumber: 1,
        chiefComplaint: 'Anxiety following divorce',
        sessionNotes: 'Initial assessment completed. Patient experiencing significant anxiety related to recent life changes.',
        clinicalObservations: 'Appropriate affect. Some tearfulness when discussing divorce.',
        interventions: 'Supportive counseling. Psychoeducation about anxiety.',
        progressAssessment: 'Establishing therapeutic rapport.',
        attachments: [],
      },
    ]);
    console.log(`Created ${consultations.length} consultations`);

    console.log('Creating sample external reports...');
    const reports = await ExternalReport.create([
      {
        patient: patients[2]._id,
        reportType: 'school',
        recipientName: 'Dr. Emily Brown',
        recipientOrganization: 'Lincoln High School',
        requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        purpose: 'Behavioral assessment for school accommodation plan',
        summary: 'Student exhibits symptoms consistent with ADHD. Recommendations include extended time for tests and preferential seating.',
        findings: 'Assessment indicates attention difficulties and impulsivity consistent with ADHD diagnosis.',
        recommendations: 'Recommend 504 plan with accommodations including extended test time, preferential seating, and regular check-ins.',
        status: 'in-progress',
        attachments: [],
      },
    ]);
    console.log(`Created ${reports.length} external reports`);

    console.log('Creating sample payments...');
    const payments = await Payment.create([
      {
        patient: patients[0]._id,
        consultation: consultations[0]._id,
        amount: 150,
        currency: 'USD',
        paymentDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        status: 'paid',
        amountPaid: 150,
        invoiceNumber: 'INV-2024-001',
      },
      {
        patient: patients[1]._id,
        consultation: consultations[1]._id,
        amount: 180,
        currency: 'USD',
        status: 'unpaid',
        amountPaid: 0,
        invoiceNumber: 'INV-2024-002',
      },
      {
        patient: patients[2]._id,
        amount: 200,
        currency: 'USD',
        paymentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        paymentMethod: 'insurance',
        status: 'partial',
        amountPaid: 100,
        invoiceNumber: 'INV-2024-003',
        notes: 'Insurance covers 50%, awaiting patient payment for remainder',
      },
    ]);
    console.log(`Created ${payments.length} payments`);

    console.log('\n✅ Seed data created successfully!');
    console.log(`\nSummary:`);
    console.log(`- ${patients.length} patients`);
    console.log(`- ${appointments.length} appointments`);
    console.log(`- ${consultations.length} consultations`);
    console.log(`- ${reports.length} external reports`);
    console.log(`- ${payments.length} payments`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
