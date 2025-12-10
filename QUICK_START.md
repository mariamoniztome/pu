# Quick Start Guide

Get the Psychology Clinic Management System running in 5 minutes.

## Prerequisites

- Node.js (v18+) installed
- MongoDB installed OR Docker installed

## Step 1: Start MongoDB

### Option A: Docker (Easiest)
```bash
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

### Option B: Local MongoDB
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## Step 2: Start Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend running at: `http://localhost:5000`

## Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend running at: `http://localhost:5173`

## Step 4: Open in Browser

Navigate to: `http://localhost:5173`

## Verify Everything Works

1. Dashboard should load with statistics
2. Navigate to "Patients" - you should see 3 sample patients
3. Click "Add Patient" to test creating a new patient
4. Try switching between Grid and Table views
5. Test the CSV export in Table view

## Stopping the Application

### Stop Frontend
Press `Ctrl+C` in the terminal running the frontend

### Stop Backend
Press `Ctrl+C` in the terminal running the backend

### Stop MongoDB (Docker)
```bash
docker stop mongodb
```

### Stop MongoDB (Local)
```bash
# Windows
net stop MongoDB

# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

## Troubleshooting

### MongoDB won't start
```bash
# If using Docker, check logs
docker logs mongodb

# Remove and recreate container
docker stop mongodb
docker rm mongodb
# Then run the docker run command again
```

### Backend won't start
```bash
# Check if MongoDB is running
mongosh

# Verify .env file exists
cat .env

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is available
npx kill-port 5173
```

### Can't connect to backend
```bash
# Verify backend is running
curl http://localhost:5000

# Check .env in frontend
cat .env
# Should have: VITE_API_URL=http://localhost:5000/api
```

## Default Credentials

No authentication is implemented yet. The application is open for development.

## Sample Data

If you ran `npm run seed`, the database includes:
- 3 Patients
- 3 Appointments
- 2 Consultations
- 1 External Report
- 3 Payments

## Next Steps

1. Read `PROJECT_OVERVIEW.md` for full architecture details
2. Read `backend/README.md` for API documentation
3. Read `frontend/README.md` for frontend development guide
4. Start building new features!

## Quick Commands Reference

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Run production server
npm run seed     # Seed database
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
npm run typecheck # Check TypeScript types
```

### MongoDB
```bash
mongosh                          # Open MongoDB shell
mongosh --eval "show dbs"       # List databases
docker exec -it mongodb mongosh # MongoDB shell in Docker
```

## Support

If you encounter issues:
1. Check this guide first
2. Read the troubleshooting section
3. Check `PROJECT_OVERVIEW.md`
4. Read the detailed READMEs in backend/ and frontend/

## Happy Coding!

You're all set! The application is now running and ready for development.
