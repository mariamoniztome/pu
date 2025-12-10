# Psychology Clinic Management System - Backend

This is the backend API for the Psychology Clinic Management System, built with Node.js, Express, MongoDB, and Mongoose.

## Tech Stack

- **Runtime**: Node.js (v18 or higher)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **File Upload**: Multer
- **Validation**: Express Validator

## Features

- **Patient Management**: Complete CRUD operations for patient records
- **Appointment Scheduling**: Create, update, and manage appointments
- **Consultation Records**: Clinical notes with file attachments
- **External Reports**: Generate reports for courts, schools, employers, etc.
- **Payment Tracking**: Monitor payment status and financial records
- **File Uploads**: Support for PDFs, images, and documents

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **MongoDB** (see installation options below)

---

## How to Run MongoDB Locally (Step-by-Step)

MongoDB is the database for this application. You have two options to run it locally:

### Option 1: Install MongoDB Directly on Your Machine

#### For Windows:

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select "Windows" and "MSI" package
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Optionally install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```bash
   mongod --version
   ```
   You should see the MongoDB version information.

4. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows Service
   - Or manually start it:
   ```bash
   net start MongoDB
   ```

5. **Check if MongoDB is Running**
   ```bash
   mongosh
   ```
   This opens the MongoDB shell. Type `exit` to quit.

#### For macOS:

1. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install MongoDB using Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

3. **Start MongoDB as a Service**
   ```bash
   brew services start mongodb-community@7.0
   ```

4. **Verify MongoDB is Running**
   ```bash
   mongosh
   ```
   You should see the MongoDB shell. Type `exit` to quit.

#### For Linux (Ubuntu/Debian):

1. **Import MongoDB Public Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB Service**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify Installation**
   ```bash
   mongosh
   ```

### Option 2: Run MongoDB with Docker (Recommended for Development)

This is the easiest way if you have Docker installed.

1. **Install Docker**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Pull and Run MongoDB Container**
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     -v mongodb_data:/data/db \
     mongo:7.0
   ```

   **What this command does:**
   - `-d`: Runs container in detached mode (background)
   - `--name mongodb`: Names the container "mongodb"
   - `-p 27017:27017`: Maps port 27017 (default MongoDB port)
   - `-e`: Sets environment variables for admin credentials
   - `-v`: Creates a persistent volume for data
   - `mongo:7.0`: Uses MongoDB version 7.0

3. **Verify MongoDB Container is Running**
   ```bash
   docker ps
   ```
   You should see the mongodb container in the list.

4. **Access MongoDB Shell in Docker**
   ```bash
   docker exec -it mongodb mongosh
   ```

5. **Stop MongoDB Container** (when needed)
   ```bash
   docker stop mongodb
   ```

6. **Restart MongoDB Container**
   ```bash
   docker start mongodb
   ```

7. **Remove MongoDB Container** (to start fresh)
   ```bash
   docker stop mongodb
   docker rm mongodb
   docker volume rm mongodb_data
   ```

### Connection String Configuration

Once MongoDB is running, configure the connection string:

**For Local MongoDB (without authentication):**
```
mongodb://localhost:27017/psychology-clinic
```

**For Docker MongoDB (with authentication):**
```
mongodb://admin:password@localhost:27017/psychology-clinic?authSource=admin
```

---

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express
- Mongoose
- TypeScript
- Multer
- CORS
- And other dependencies

### Step 3: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your settings:**
   ```
   PORT=5000
   NODE_ENV=development

   # Update this based on your MongoDB setup
   MONGODB_URI=mongodb://localhost:27017/psychology-clinic

   FRONTEND_URL=http://localhost:5173
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   ```

   **Important Notes:**
   - If using Docker with authentication, use: `mongodb://admin:password@localhost:27017/psychology-clinic?authSource=admin`
   - `MAX_FILE_SIZE` is in bytes (10485760 = 10MB)
   - `UPLOAD_DIR` is where uploaded files will be stored

### Step 4: Verify MongoDB Connection

Before starting the server, ensure MongoDB is accessible:

```bash
# If using local MongoDB
mongosh

# If using Docker
docker exec -it mongodb mongosh
```

If you can connect successfully, MongoDB is ready!

### Step 5: Seed the Database (Optional)

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- 3 sample patients
- 3 sample appointments
- 2 sample consultations
- 1 sample external report
- 3 sample payment records

**Note**: This will DELETE all existing data first!

### Step 6: Start the Development Server

```bash
npm run dev
```

You should see output like:
```
✅ MongoDB connected successfully
📍 Connected to: localhost
🗄️  Database: psychology-clinic

🚀 Server is running on port 5000
📡 API available at: http://localhost:5000
🌐 Frontend URL: http://localhost:5173

✨ Ready to accept requests!
```

### Step 7: Verify API is Working

Open your browser or use curl to test:

```bash
curl http://localhost:5000
```

You should see:
```json
{
  "message": "Psychology Clinic Management API",
  "version": "1.0.0",
  "endpoints": {
    "patients": "/api/patients",
    "appointments": "/api/appointments",
    "consultations": "/api/consultations",
    "externalReports": "/api/external-reports",
    "payments": "/api/payments"
  }
}
```

---

## API Endpoints

### Patients

- `GET /api/patients` - Get all patients
- `GET /api/patients/search?q=<query>` - Search patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments

- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/patient/:patientId` - Get appointments by patient
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Consultations

- `GET /api/consultations` - Get all consultations
- `GET /api/consultations/patient/:patientId` - Get consultations by patient
- `GET /api/consultations/:id` - Get consultation by ID
- `POST /api/consultations` - Create new consultation (with file uploads)
- `PUT /api/consultations/:id` - Update consultation (with file uploads)
- `DELETE /api/consultations/:id` - Delete consultation
- `DELETE /api/consultations/:id/attachments/:filename` - Delete specific attachment

### External Reports

- `GET /api/external-reports` - Get all reports
- `GET /api/external-reports/patient/:patientId` - Get reports by patient
- `GET /api/external-reports/:id` - Get report by ID
- `POST /api/external-reports` - Create new report (with file uploads)
- `PUT /api/external-reports/:id` - Update report (with file uploads)
- `DELETE /api/external-reports/:id` - Delete report
- `DELETE /api/external-reports/:id/attachments/:filename` - Delete specific attachment

### Payments

- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/patient/:patientId` - Get payments by patient
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment (with receipt upload)
- `PUT /api/payments/:id` - Update payment (with receipt upload)
- `DELETE /api/payments/:id` - Delete payment

---

## File Upload

The API supports file uploads for:
- **Consultation attachments**: Multiple files (up to 10 per request)
- **External report attachments**: Multiple files (up to 10 per request)
- **Payment receipts**: Single file

**Supported file types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT

**Maximum file size:** 10MB (configurable via `MAX_FILE_SIZE` in `.env`)

**Uploaded files** are stored in the `uploads/` directory.

---

## Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server (after build)
npm start

# Seed database with sample data
npm run seed
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── patientController.ts
│   │   ├── appointmentController.ts
│   │   ├── consultationController.ts
│   │   ├── externalReportController.ts
│   │   └── paymentController.ts
│   ├── middleware/
│   │   ├── upload.ts            # Multer configuration
│   │   └── errorHandler.ts      # Global error handling
│   ├── models/
│   │   ├── Patient.ts
│   │   ├── Appointment.ts
│   │   ├── Consultation.ts
│   │   ├── ExternalReport.ts
│   │   └── Payment.ts
│   ├── routes/
│   │   ├── patientRoutes.ts
│   │   ├── appointmentRoutes.ts
│   │   ├── consultationRoutes.ts
│   │   ├── externalReportRoutes.ts
│   │   └── paymentRoutes.ts
│   ├── scripts/
│   │   └── seed.ts              # Database seeding
│   └── server.ts                # Application entry point
├── uploads/                     # Uploaded files directory
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   # For local MongoDB
   mongosh

   # For Docker
   docker ps
   ```

2. Check if MongoDB is listening on port 27017:
   ```bash
   netstat -an | grep 27017
   ```

3. Verify your connection string in `.env`

4. If using Docker, ensure the container is running:
   ```bash
   docker start mongodb
   ```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
Change the `PORT` in `.env` to a different value (e.g., 5001)

### File Upload Errors

**Error:** `File too large` or `File type not allowed`

**Solutions:**
1. Check `MAX_FILE_SIZE` in `.env` (in bytes)
2. Verify file type is in the allowed list (see File Upload section)
3. Ensure the `uploads/` directory exists and is writable

### TypeScript Errors

**Error:** Type errors during development

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

### Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Update your `.env` for production:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
FRONTEND_URL=<your-frontend-url>
```

### Hosting Recommendations

- **Backend**: Railway, Render, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas (free tier available)
- **Files**: Consider AWS S3 or similar for file storage in production

---

## MongoDB Atlas (Cloud Database)

For production or cloud development, consider using MongoDB Atlas:

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster**
3. **Get connection string**:
   - Navigate to "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

4. **Update `.env`**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/psychology-clinic?retryWrites=true&w=majority
   ```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running and accessible
4. Check the console for error messages

---

## License

MIT License - This project is for academic purposes.
