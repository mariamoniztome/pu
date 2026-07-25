# Clinicamente - Frontend

A modern, full-featured web application for managing a psychology clinic, built with React, TypeScript, Tailwind CSS, shadcn/ui, and AG Grid.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Data Grid**: AG Grid Community Edition
- **Routing**: React Router v6
- **Icons**: Lucide React

## Features

- **Dashboard**: Overview of clinic statistics and key metrics
- **Patient Management**:
  - Complete CRUD operations
  - Grid and table view modes
  - Search functionality
  - Export to CSV
  - Detailed patient profiles
- **Appointment Management**: Schedule and track appointments
- **Consultation Records**: Clinical notes with file attachments
- **External Reports**: Generate reports for courts, schools, etc.
- **Payment Tracking**: Monitor invoices and payment status

## Prerequisites

- **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Backend API** running (see backend README for setup)

## Installation and Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- React Router
- AG Grid
- Tailwind CSS
- Lucide React (icons)
- TypeScript
- And other dependencies

### Step 2: Configure Environment Variables

The `.env` file should already be configured with:

```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Important Notes:**
- Make sure the `VITE_API_URL` matches your backend server address
- Default backend runs on `http://localhost:5000`
- The `/api` prefix is required for all API endpoints

### Step 3: Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (default Vite port).

You should see output like:
```
  VITE v5.4.2  ready in 326 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Clinicamente dashboard.

## Available Scripts

### Development

```bash
npm run dev
```
Starts the development server with hot module replacement (HMR). Changes you make will automatically reload in the browser.

### Build for Production

```bash
npm run build
```
Creates an optimized production build in the `dist/` directory. The build is minified and optimized for best performance.

### Preview Production Build

```bash
npm run preview
```
Serves the production build locally for testing before deployment.

### Type Checking

```bash
npm run typecheck
```
Runs TypeScript type checking without emitting files. Useful for catching type errors.

### Linting

```bash
npm run lint
```
Runs ESLint to check for code quality issues and potential errors.

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client and service functions
│   │   ├── axios.ts            # Base API client
│   │   ├── patients.ts         # Patient API calls
│   │   ├── appointments.ts     # Appointment API calls
│   │   ├── consultations.ts    # Consultation API calls
│   │   ├── externalReports.ts  # External Report API calls
│   │   ├── payments.ts         # Payment API calls
│   │   └── index.ts            # API exports
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── textarea.tsx
│   │   ├── Layout.tsx          # Main layout with navigation
│   │   ├── PatientCard.tsx     # Patient grid view card
│   │   ├── PatientForm.tsx     # Patient create/edit form
│   │   └── ...                 # Other components
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── pages/                  # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── ConsultationsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── PaymentsPage.tsx
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Main App component with routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── .env                        # Environment variables
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md
```

## Key Features Explained

### Grid and Table Views

The Patients page demonstrates the dual-view pattern:

- **Grid View**: Card-based layout for easy scanning and quick actions
- **Table View**: AG Grid with sorting, filtering, and CSV export

You can easily apply this pattern to other modules.

### AG Grid Integration

AG Grid Community Edition is configured with:
- Column sorting
- Built-in filtering
- Pagination
- Responsive design
- Export functionality

### API Integration

All API calls go through the centralized `api/` directory:

```typescript
import { patientsApi } from './api';

// Get all patients
const patients = await patientsApi.getAll();

// Create a patient
const newPatient = await patientsApi.create(patientData);

// Update a patient
await patientsApi.update(patientId, updatedData);
```

## Connecting to the Backend

### Ensure Backend is Running

Before using the frontend, make sure your backend is running:

```bash
cd ../backend
npm run dev
```

The backend should be accessible at `http://localhost:5000`.

### Testing the Connection

1. Open the browser console (F12)
2. Navigate to the Dashboard
3. Check for any network errors
4. Verify data loads correctly

If you see CORS errors, ensure:
- Backend `FRONTEND_URL` in `.env` matches your frontend URL
- Backend CORS is properly configured
- Both servers are running

## Troubleshooting

### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### API Connection Failed

**Error**: Network errors or "Failed to fetch"

**Solutions**:
1. Verify backend is running: `http://localhost:5000`
2. Check `VITE_API_URL` in `.env`
3. Ensure no firewall is blocking the connection
4. Check browser console for specific errors

### Build Errors

**Error**: TypeScript or build errors

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for type errors
npm run typecheck
```

## Production Deployment

### Build the Application

```bash
npm run build
```

This creates optimized static files in the `dist/` directory.

### Deploy to Hosting

The `dist/` folder can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **AWS S3**: Upload to S3 bucket with static hosting
- **GitHub Pages**: Use `gh-pages` package
- **Any static hosting service**

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - This project is for academic purposes.
