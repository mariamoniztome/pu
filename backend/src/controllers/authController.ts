import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import Organization from '../models/Organization';
import { generateToken } from '../middleware/auth';

// Register a new organization and doctor (owner)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // Organization details
      organizationName,
      organizationType,
      organizationEmail,
      organizationPhone,
      // Doctor details
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
    } = req.body;

    // Validate required fields
    if (!organizationName || !email || !password || !firstName || !lastName) {
      res.status(400).json({ 
        message: 'Organization name, email, password, first name, and last name are required' 
      });
      return;
    }

    // Check if organization email already exists
    const existingOrg = await Organization.findOne({ email: organizationEmail || email });
    if (existingOrg) {
      res.status(400).json({ message: 'Organization email already registered' });
      return;
    }

    // Check if doctor email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      res.status(400).json({ message: 'Doctor email already registered' });
      return;
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      type: organizationType || 'individual',
      email: organizationEmail || email,
      phone: organizationPhone,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        maxDoctors: organizationType === 'clinic' ? 10 : 1,
        maxPatients: 50,
      },
      settings: {
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        currency: 'EUR',
        allowDataSharing: organizationType === 'clinic',
      },
      isActive: true,
    });

    // Create doctor (owner)
    const doctor = await Doctor.create({
      organization: organization._id,
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
      role: 'owner',
      isActive: true,
    });

    // Generate token
    const token = generateToken(doctor, organization);

    // Return response (without password)
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json({
      message: 'Registration successful',
      token,
      doctor: doctorResponse,
      organization,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find doctor with password field
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if doctor is active
    if (!doctor.isActive) {
      res.status(401).json({ message: 'Account is inactive' });
      return;
    }

    // Verify password
    const isPasswordValid = await doctor.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Get organization
    const organization = await Organization.findById(doctor.organization);
    if (!organization || !organization.isActive) {
      res.status(401).json({ message: 'Organization not found or inactive' });
      return;
    }

    // Check subscription
    if (organization.subscription.status !== 'active') {
      res.status(403).json({ 
        message: 'Subscription inactive', 
        subscriptionStatus: organization.subscription.status 
      });
      return;
    }

    // Generate token
    const token = generateToken(doctor, organization);

    // Update last login
    doctor.lastLogin = new Date();
    await doctor.save();

    // Return response (without password)
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      doctor: doctorResponse,
      organization,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user info
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      doctor: req.doctor,
      organization: req.organization,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get user info', error: error.message });
  }
};

// Invite a new doctor to the organization
export const inviteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
      role,
      permissions,
    } = req.body;

    // Check if requesting doctor has permission
    if (!req.doctor.permissions.canManageDoctors && req.doctor.role !== 'owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // Check subscription limits
    const doctorCount = await Doctor.countDocuments({ 
      organization: req.organization._id,
      isActive: true 
    });

    if (doctorCount >= req.organization.subscription.maxDoctors) {
      res.status(403).json({ 
        message: 'Maximum number of doctors reached for your subscription plan',
        current: doctorCount,
        max: req.organization.subscription.maxDoctors
      });
      return;
    }

    // Check if email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Create doctor
    const doctor = await Doctor.create({
      organization: req.organization._id,
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
      role: role || 'member',
      permissions: permissions || {},
      isActive: true,
    });

    // Return response (without password)
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json({
      message: 'Doctor invited successfully',
      doctor: doctorResponse,
    });
  } catch (error: any) {
    console.error('Invite doctor error:', error);
    res.status(500).json({ message: 'Failed to invite doctor', error: error.message });
  }
};

// Get all doctors in the organization
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find({ 
      organization: req.organization._id 
    }).select('-password');

    res.status(200).json({ doctors });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get doctors', error: error.message });
  }
};

// Update doctor
export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const updates = req.body;

    // Check permissions
    if (req.doctor._id.toString() !== doctorId && 
        !req.doctor.permissions.canManageDoctors && 
        req.doctor.role !== 'owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // Don't allow password updates through this endpoint
    delete updates.password;
    delete updates.organization;

    const doctor = await Doctor.findOneAndUpdate(
      { _id: doctorId, organization: req.organization._id },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json({ doctor });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update doctor', error: error.message });
  }
};

// Delete/deactivate doctor
export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;

    // Check permissions
    if (!req.doctor.permissions.canManageDoctors && req.doctor.role !== 'owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // Don't allow deleting yourself
    if (req.doctor._id.toString() === doctorId) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    // Don't allow deleting the owner
    const targetDoctor = await Doctor.findOne({ 
      _id: doctorId, 
      organization: req.organization._id 
    });

    if (!targetDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    if (targetDoctor.role === 'owner') {
      res.status(400).json({ message: 'Cannot delete organization owner' });
      return;
    }

    // Soft delete
    targetDoctor.isActive = false;
    await targetDoctor.save();

    res.status(200).json({ message: 'Doctor deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
};
