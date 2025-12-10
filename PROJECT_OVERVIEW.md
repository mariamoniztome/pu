# Psychology Clinic Management System

A comprehensive full-stack web application for managing a psychology clinic, built as an academic project for a master's degree.

## Project Overview

This system provides complete management capabilities for a psychology clinic, including patient records, appointment scheduling, clinical consultations, external reporting, and financial tracking.

## Architecture

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **File Upload**: Multer
- **API Style**: RESTful JSON API

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Data Grid**: AG Grid Community Edition
- **Routing**: React Router v6
- **Icons**: Lucide React

## Project Structure

```
project/
├── backend/                    # Backend API (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware (upload, errors)
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── scripts/           # Utility scripts (seeding)
│   │   └── server.ts          # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md              # Backend documentation
│
├── frontend/                   # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/               # API client and services
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   │   ├── Layout.tsx
│   │   │   ├── PatientCard.tsx
│   │   │   └── PatientForm.tsx
│   │   ├── lib/               # Utilities
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main app with routing
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── README.md              # Frontend documentation
│
└── PROJECT_OVERVIEW.md        # This file
```

## Core Features

### 1. Patient Management
- Complete CRUD operations
- Detailed patient profiles with personal information
- Emergency contact information
- Family and context notes
- Medical history
- **Dual View Modes**:
  - Grid view: Card-based layout for quick scanning
  - Table view: AG Grid with sorting, filtering, and CSV export
- Search functionality

### 2. Appointment Management
- Schedule appointments with patients
- Multiple appointment types (initial, follow-up, assessment, therapy)
- Status tracking (scheduled, confirmed, completed, cancelled, no-show)
- Duration management
- Notes and reminders

### 3. Consultation Records
- Detailed session documentation
- Chief complaints
- Clinical observations
- Interventions and homework
- Progress assessment
- Next session planning
- **File Attachments**: Upload PDFs, images, documents
- Session numbering

### 4. External Reports
- Generate reports for external entities
- Multiple report types (court, school, employer, insurance, medical)
- Recipient information
- Status tracking (requested, in-progress, completed, delivered)
- Purpose and findings documentation
- Recommendations
- **File Attachments**: Attach report documents

### 5. Financial Management
- Payment tracking per consultation
- Invoice generation
- Payment status (unpaid, partial, paid)
- Multiple payment methods
- Receipt uploads
- Payment statistics dashboard

## Data Models

### Patient
- Personal information (name, DOB, gender, contact)
- Emergency contact
- Family and context notes
- Medical history

### Appointment
- Patient reference
- Date and time
- Duration
- Type and status
- Notes

### Consultation
- Patient and appointment references
- Session number
- Clinical notes (complaints, observations, interventions)
- Progress tracking
- File attachments

### External Report
- Patient reference
- Report type and status
- Recipient information
- Purpose, findings, recommendations
- File attachments

### Payment
- Patient and consultation references
- Amount and payment status
- Payment method
- Invoice number
- Receipt attachment

## Getting Started

### Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **MongoDB** - See backend README for installation options
3. **npm** or **yarn**

### Quick Start Guide

#### 1. Set Up MongoDB

Choose one of these options:

**Option A: Local Installation**
```bash
# See backend/README.md for detailed OS-specific instructions
```

**Option B: Docker (Recommended)**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:7.0
```

#### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Seed database (optional but recommended)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env - ensure VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

#### 4. Access the Application

Open your browser to `http://localhost:5173`

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/search?q=query` - Search patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/patient/:patientId` - Get patient's appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Consultations
- `GET /api/consultations` - Get all consultations
- `GET /api/consultations/patient/:patientId` - Get patient's consultations
- `POST /api/consultations` - Create consultation (with file uploads)
- `PUT /api/consultations/:id` - Update consultation (with file uploads)
- `DELETE /api/consultations/:id` - Delete consultation

### External Reports
- `GET /api/external-reports` - Get all reports
- `GET /api/external-reports/patient/:patientId` - Get patient's reports
- `POST /api/external-reports` - Create report (with file uploads)
- `PUT /api/external-reports/:id` - Update report
- `DELETE /api/external-reports/:id` - Delete report

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/patient/:patientId` - Get patient's payments
- `POST /api/payments` - Create payment (with receipt upload)
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

## Development Workflow

### Backend Development

```bash
cd backend

# Start with hot reload
npm run dev

# Build TypeScript
npm run build

# Run in production
npm start

# Seed database
npm run seed
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Technologies Explained

### Why MongoDB?
- Flexible schema for evolving requirements
- JSON-like documents match JavaScript/TypeScript
- Easy to learn and use
- Good for academic projects
- Mongoose provides excellent ODM layer

### Why AG Grid?
- Professional-grade data grid
- Community edition is free
- Built-in sorting, filtering, pagination
- Export to CSV/Excel
- Excellent TypeScript support

### Why shadcn/ui?
- Modern, clean component design
- Copy-paste components (no package bloat)
- Full TypeScript support
- Built on Radix UI primitives
- Easily customizable with Tailwind

### Why Vite?
- Lightning-fast HMR
- Optimized builds
- Native ES modules
- Better than Create React App
- Excellent TypeScript support

## Features Implementation Status

- [x] Patient Management (CRUD, search, dual views)
- [x] Appointment Management (scheduling, status)
- [x] Consultation Records (notes, attachments)
- [x] External Reports (types, attachments)
- [x] Payment Tracking (status, receipts)
- [x] Dashboard (statistics, overview)
- [x] File Upload Support
- [x] AG Grid Integration
- [x] CSV Export
- [x] Responsive Design
- [x] TypeScript Throughout
- [x] Error Handling
- [x] REST API
- [x] Database Seeding

## Future Enhancements

Potential features for future versions:
- [ ] User authentication and authorization
- [ ] Role-based access control
- [ ] Calendar view for appointments
- [ ] Automated appointment reminders
- [ ] PDF report generation
- [ ] Advanced analytics and charts
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app
- [ ] Real-time updates with WebSockets
- [ ] Backup and restore functionality
- [ ] Audit logs

## Testing

### Backend Testing (to implement)
```bash
cd backend
npm test
```

### Frontend Testing (to implement)
```bash
cd frontend
npm test
```

## Production Deployment

### Backend Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern deployment platform
- **AWS EC2**: Full control
- **DigitalOcean**: Affordable VPS
- **Render**: Simple deployment

### Frontend Deployment Options
- **Vercel**: Optimized for React/Vite
- **Netlify**: Easy static hosting
- **AWS S3 + CloudFront**: Scalable
- **GitHub Pages**: Free hosting

### Database Hosting
- **MongoDB Atlas**: Free tier available
- **DigitalOcean Managed MongoDB**
- **AWS DocumentDB**

## Documentation

- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **This File**: Project overview and getting started

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in backend `.env`
   - Ensure port 27017 is not blocked

2. **CORS Errors**
   - Check backend `FRONTEND_URL` in `.env`
   - Verify both servers are running
   - Check browser console for specific errors

3. **File Upload Errors**
   - Check `MAX_FILE_SIZE` in backend `.env`
   - Ensure `uploads/` directory exists
   - Verify file types are allowed

4. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

## License

MIT License - This project is for academic purposes.

## Academic Context

This project was developed as part of a master's degree program to demonstrate:
- Full-stack development skills
- Modern web technologies
- Database design and management
- RESTful API design
- TypeScript proficiency
- UI/UX design principles
- Documentation best practices

## Credits

Built with:
- React, TypeScript, Tailwind CSS
- Node.js, Express, MongoDB
- shadcn/ui components
- AG Grid Community Edition
- Lucide React icons
- Vite build tool

---

For detailed setup instructions, see:
- `backend/README.md` - Backend setup and MongoDB installation
- `frontend/README.md` - Frontend setup and configuration
