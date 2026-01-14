# Psychology Clinic Management System

A complete full-stack application for managing a psychology clinic, featuring a modern React frontend and a Node.js backend with MongoDB.

## Project Structure

```
project-root/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── backend/           # Node.js backend API
│   ├── src/           # Source code
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── .env               # Environment variables (root level)
├── PROJECT_OVERVIEW.md
├── QUICK_START.md
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Setup Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

See [backend/README.md](backend/README.md) for detailed setup instructions.

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

See [frontend/README.md](frontend/README.md) for detailed setup instructions.

## Features

- **Patient Management**: Complete CRUD operations for patient records
- **Appointment Scheduling**: Calendar view and appointment management
- **Consultation Records**: Clinical notes with file attachments
- **Payment Tracking**: Invoice generation and payment status
- **External Reports**: Generate reports for courts, schools, etc.
- **Dashboard**: Overview of clinic statistics

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- AG Grid for data tables
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- Multer for file uploads
- CORS enabled

## 📚 Documentation

Comprehensive documentation is available for all aspects of the project:

### Getting Started
- [**QUICK_REFERENCE.md**](QUICK_REFERENCE.md) - Fast lookup for common tasks and commands
- [**DOCUMENTATION.md**](DOCUMENTATION.md) - Complete project documentation with architecture and setup

### Detailed Guides
- [**API_REFERENCE.md**](API_REFERENCE.md) - Complete API endpoint reference with examples
- [**DEVELOPMENT_GUIDE.md**](DEVELOPMENT_GUIDE.md) - Guide for developers contributing to the project
- [**DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md) - Production deployment and operations guide
- [**CREDENTIALS_AND_JWT_GUIDE.md**](CREDENTIALS_AND_JWT_GUIDE.md) - Security and authentication details
- [**MULTI_TENANCY_README.md**](MULTI_TENANCY_README.md) - Multi-tenancy architecture

### Component-Specific
- [Frontend README](frontend/README.md) - Frontend setup and development
- [Backend README](backend/README.md) - Backend setup and API documentation

## Development Workflow

1. Start the backend server first
2. Start the frontend development server
3. The frontend will automatically connect to the backend API
4. Make changes and see them hot-reload

## Environment Variables

Environment variables are configured at the root level in `.env` and are shared between frontend and backend where applicable.

See individual README files for specific environment variable requirements.

## License

MIT License - This project is for academic purposes.
