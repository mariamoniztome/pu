# Psychology Clinic Management System - Frontend

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

### Step 1: Navigate to the Project Directory

```bash
cd frontend
```

If you're in the root directory of the monorepo, the frontend code is in the main project folder.

### Step 2: Install Dependencies

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

### Step 3: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your API URL:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

   **Important Notes:**
   - Make sure the `VITE_API_URL` matches your backend server address
   - Default backend runs on `http://localhost:5000`
   - The `/api` prefix is required for all API endpoints

### Step 4: Start the Development Server

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

### Step 5: Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Psychology Clinic Management System dashboard.

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
│   │   ├── client.ts           # Base API client
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
│   │   └── PatientForm.tsx     # Patient create/edit form
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── pages/                  # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── AppointmentsPage.tsx
│   │   ├── ConsultationsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── PaymentsPage.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main App component with routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── .env                        # Environment variables
├── .env.example                # Environment variables template
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

### Error Handling

The API client includes built-in error handling:
- HTTP status code checking
- Error message extraction
- Custom `ApiError` class

### File Uploads

For endpoints that support file uploads (consultations, reports, payments):

```typescript
const formData = new FormData();
formData.append('field', value);
formData.append('file', file);

await consultationsApi.create(formData);
```

## UI Components (shadcn/ui)

The application uses shadcn/ui-style components:

- **Button**: Multiple variants (default, outline, destructive, ghost, link)
- **Card**: For content containers
- **Input**: Text inputs with validation
- **Label**: Form labels
- **Select**: Dropdown selects
- **Textarea**: Multi-line text inputs

All components are fully typed with TypeScript and customizable with Tailwind classes.

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling:
- Utility-first approach
- Responsive design
- Custom color palette
- Consistent spacing

### Design System

Color palette:
- **Primary**: Slate (neutral, professional)
- **Success**: Green
- **Warning**: Orange
- **Danger**: Red
- **Info**: Blue

### Responsive Design

The application is fully responsive:
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: 3-4 column grids

## Connecting to the Backend

### Ensure Backend is Running

Before using the frontend, make sure your backend is running:

```bash
cd backend
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

### Styling Issues

**Error**: Styles not applying correctly

**Solutions**:
1. Verify Tailwind CSS is configured in `tailwind.config.js`
2. Check `index.css` imports Tailwind directives
3. Clear browser cache (Ctrl+Shift+R)
4. Restart dev server

### AG Grid Issues

**Error**: Table not displaying correctly

**Solutions**:
1. Ensure AG Grid CSS is imported
2. Check container has explicit height
3. Verify data format matches column definitions

## Production Deployment

### Build the Application

```bash
npm run build
```

This creates optimized static files in the `dist/` directory.

### Preview Production Build Locally

```bash
npm run preview
```

### Deploy to Hosting

The `dist/` folder can be deployed to:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **AWS S3**: Upload to S3 bucket with static hosting
- **GitHub Pages**: Use `gh-pages` package
- **Any static hosting service**

### Environment Variables for Production

Create a `.env.production` file:

```
VITE_API_URL=https://your-production-api.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

The application is optimized for performance:
- Code splitting with React Router
- Lazy loading of routes
- Optimized production builds
- Efficient re-renders with React hooks
- AG Grid virtualization for large datasets

## Accessibility

- Semantic HTML
- Keyboard navigation support
- ARIA labels where appropriate
- Focus management
- Screen reader friendly

## Future Enhancements

Potential features to add:
- Advanced search and filtering
- Calendar view for appointments
- Report generation (PDF)
- Real-time notifications
- User authentication and roles
- Dark mode
- Multi-language support
- Offline support with service workers

## Support

For issues or questions:
1. Check this README
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify backend connection
5. Ensure all environment variables are set

## License

MIT License - This project is for academic purposes.

---

## Quick Start Checklist

- [ ] Node.js installed (v18+)
- [ ] Backend API running on `http://localhost:5000`
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Development server started (`npm run dev`)
- [ ] Browser opened to `http://localhost:5173`
- [ ] Data loading successfully from backend

Happy coding!
