import { Request, Response } from 'express';
import crypto from 'crypto';
import Doctor from '../models/Doctor.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../middleware/auth.js';
import { PERMISSION_KEYS, isValidPermissionKey } from '../utils/permissions.js';
import { isGenuineImage } from '../middleware/upload.js';
import { sendMail } from '../utils/mailer.js';
import fs from 'fs';

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
    const { password: _doctorPassword, ...doctorResponse } = doctor.toObject();

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

    // Invited doctors have no password until they accept the invite
    if (doctor.invitePending || !doctor.password) {
      res.status(401).json({ message: 'Please accept your invitation first — check your email for the invite link' });
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
    const { password: _doctorPassword, ...doctorResponse } = doctor.toObject();

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

// Invite a new doctor to the organization. The invitee receives an email
// with a link where they review their pre-filled details and choose their
// own password — no password is set (or known) by the inviter.
export const inviteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
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

    const rawToken = crypto.randomBytes(32).toString('hex');

    const doctor = await Doctor.create({
      organization: req.organization._id,
      firstName,
      lastName,
      email,
      phone,
      specialization,
      licenseNumber,
      role: role || 'member',
      permissions: permissions || {},
      isActive: true,
      invitePending: true,
      inviteToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
      inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/accept-invite/${rawToken}`;
    const orgName = req.organization.name;

    const { sent } = await sendMail({
      to: doctor.email,
      subject: `You've been invited to join ${orgName}`,
      text: `Hello ${doctor.firstName},\n\n${req.doctor.firstName} ${req.doctor.lastName} invited you to join ${orgName}. Open the link below to review your details and choose your password:\n\n${inviteUrl}\n\nThis invitation expires in 7 days.`,
      html: `<p>Hello ${doctor.firstName},</p><p><strong>${req.doctor.firstName} ${req.doctor.lastName}</strong> invited you to join <strong>${orgName}</strong>.</p><p><a href="${inviteUrl}">Accept the invitation</a> to review your details and choose your password.</p><p>This invitation expires in 7 days.</p>`,
    });

    if (!sent) {
      console.log(`Invite created for ${doctor.email}. Invite link: ${inviteUrl}`);
    }

    const { password: _doctorPassword, inviteToken: _inviteToken, ...doctorResponse } = doctor.toObject();

    res.status(201).json({
      message: 'Doctor invited successfully',
      doctor: doctorResponse,
      emailSent: sent,
      // Only exposed when no email could be sent, so the inviter can pass
      // the link along manually (dev / SMTP not configured).
      ...(sent ? {} : { inviteUrl }),
    });
  } catch (error: any) {
    console.error('Invite doctor error:', error);
    res.status(500).json({ message: 'Failed to invite doctor', error: error.message });
  }
};

// Look up a pending invitation by its token (public — the invitee is not
// logged in). Returns the pre-filled details shown on the accept page.
export const getInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const doctor = await Doctor.findOne({
      inviteToken: hashedToken,
      inviteExpires: { $gt: new Date() },
      invitePending: true,
    }).select('+inviteToken +inviteExpires');

    if (!doctor) {
      res.status(404).json({ message: 'Invalid or expired invitation' });
      return;
    }

    const organization = await Organization.findById(doctor.organization);

    res.status(200).json({
      invite: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        role: doctor.role,
        organizationName: organization?.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to load invitation', error: error.message });
  }
};

// Accept an invitation: the invitee chooses their password and is logged in.
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };

    if (!token || !password) {
      res.status(400).json({ message: 'token and password are required' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const doctor = await Doctor.findOne({
      inviteToken: hashedToken,
      inviteExpires: { $gt: new Date() },
      invitePending: true,
    }).select('+inviteToken +inviteExpires');

    if (!doctor) {
      res.status(404).json({ message: 'Invalid or expired invitation' });
      return;
    }

    doctor.password = password;
    doctor.invitePending = false;
    doctor.inviteToken = undefined;
    doctor.inviteExpires = undefined;
    doctor.lastLogin = new Date();
    await doctor.save();

    const organization = await Organization.findById(doctor.organization);
    if (!organization || !organization.isActive) {
      res.status(401).json({ message: 'Organization not found or inactive' });
      return;
    }

    const authToken = generateToken(doctor, organization);
    const { password: _doctorPassword, ...doctorResponse } = doctor.toObject();

    res.status(200).json({
      message: 'Invitation accepted',
      token: authToken,
      doctor: doctorResponse,
      organization,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to accept invitation', error: error.message });
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

// Fields a doctor may change on their own profile. Deliberately excludes
// role/permissions/isActive so self-updates can never self-escalate.
const SELF_UPDATABLE_FIELDS = ['firstName', 'lastName', 'phone', 'specialization', 'licenseNumber'] as const;
const MANAGER_UPDATABLE_FIELDS = [...SELF_UPDATABLE_FIELDS, 'role', 'permissions', 'isActive'] as const;

// Update doctor
export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const isSelf = req.doctor._id.toString() === doctorId;
    const isManager = req.doctor.role === 'owner' || req.doctor.permissions.canManageDoctors;

    if (!isSelf && !isManager) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // A manager editing someone else can change role/permissions/isActive.
    // Editing your own record (even as a manager) is restricted to profile
    // fields only, so nobody can grant themselves new access.
    const allowedFields = isManager && !isSelf ? MANAGER_UPDATABLE_FIELDS : SELF_UPDATABLE_FIELDS;
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in req.body) updates[field] = req.body[field];
    }

    if (updates.role === 'owner' && req.doctor.role !== 'owner') {
      res.status(403).json({ message: 'Only an owner can grant the owner role' });
      return;
    }

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

// Grant/revoke individual permission flags for a doctor. Separate from
// updateDoctor because that endpoint replaces the whole `permissions`
// sub-document on write — fine for role changes, but it would silently wipe
// every other flag if used to toggle just one. This merges via dot-notation
// $set instead, and only ever touches keys explicitly present in the request.
export const updateDoctorPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { permissions } = req.body as { permissions?: Record<string, unknown> };

    const isManager = req.doctor.role === 'owner' || req.doctor.permissions.canManageDoctors;
    if (!isManager) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    if (req.doctor._id.toString() === doctorId) {
      res.status(403).json({ message: 'You cannot change your own permissions' });
      return;
    }

    if (!permissions || typeof permissions !== 'object') {
      res.status(400).json({ message: 'permissions object is required' });
      return;
    }

    const invalidKeys = Object.keys(permissions).filter((key) => !isValidPermissionKey(key));
    if (invalidKeys.length > 0) {
      res.status(400).json({ message: `Unknown permission key(s): ${invalidKeys.join(', ')}`, validKeys: PERMISSION_KEYS });
      return;
    }

    const targetDoctor = await Doctor.findOne({ _id: doctorId, organization: req.organization._id });
    if (!targetDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    if (targetDoctor.role === 'owner') {
      res.status(403).json({ message: "An owner's permissions can't be edited — they always have full access" });
      return;
    }

    const setOps: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(permissions)) {
      setOps[`permissions.${key}`] = Boolean(value);
    }

    const doctor = await Doctor.findOneAndUpdate(
      { _id: doctorId, organization: req.organization._id },
      { $set: setOps },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ doctor });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update permissions', error: error.message });
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

// Upload/replace a doctor's avatar. Self, or a manager with
// canManageTeamProfiles/canManageDoctors/owner.
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const isSelf = req.doctor._id.toString() === doctorId;
    const isManager =
      req.doctor.role === 'owner' ||
      req.doctor.permissions.canManageTeamProfiles ||
      req.doctor.permissions.canManageDoctors;

    if (!isSelf && !isManager) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!isGenuineImage(file.path)) {
      fs.unlinkSync(file.path);
      res.status(400).json({ message: 'File is not a valid PNG, JPEG, or WEBP image' });
      return;
    }

    const targetDoctor = await Doctor.findOne({ _id: doctorId, organization: req.organization._id });
    if (!targetDoctor) {
      fs.unlinkSync(file.path);
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    const previousPath = targetDoctor.avatar;
    targetDoctor.avatar = file.path.replace(/\\/g, '/');
    await targetDoctor.save();

    if (previousPath && fs.existsSync(previousPath)) {
      fs.unlinkSync(previousPath);
    }

    const { password: _password, ...doctorResponse } = targetDoctor.toObject();
    res.status(200).json({ doctor: doctorResponse });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to upload avatar', error: error.message });
  }
};

export const deleteAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const isSelf = req.doctor._id.toString() === doctorId;
    const isManager =
      req.doctor.role === 'owner' ||
      req.doctor.permissions.canManageTeamProfiles ||
      req.doctor.permissions.canManageDoctors;

    if (!isSelf && !isManager) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const targetDoctor = await Doctor.findOne({ _id: doctorId, organization: req.organization._id });
    if (!targetDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    if (targetDoctor.avatar && fs.existsSync(targetDoctor.avatar)) {
      fs.unlinkSync(targetDoctor.avatar);
    }
    targetDoctor.avatar = undefined;
    await targetDoctor.save();

    res.status(200).json({ message: 'Avatar removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete avatar', error: error.message });
  }
};

// Change your own password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'currentPassword and newPassword are required' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    const doctor = await Doctor.findById(req.doctor._id).select('+password');
    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    const isValid = await doctor.comparePassword(currentPassword);
    if (!isValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

// Request a password reset link (public — logged-out flow)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() });

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate registered emails.
    if (doctor) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      doctor.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      doctor.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await doctor.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;
      const { sent } = await sendMail({
        to: doctor.email,
        subject: 'Reset your password',
        text: `Hello ${doctor.firstName},\n\nUse the link below to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Hello ${doctor.firstName},</p><p><a href="${resetUrl}">Reset your password</a> (valid for 1 hour).</p><p>If you didn't request this, you can ignore this email.</p>`,
      });
      if (!sent) {
        console.log(`Password reset requested for ${doctor.email}. Reset link: ${resetUrl}`);
      }
    }

    res.status(200).json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process password reset request', error: error.message });
  }
};

// Complete a password reset using the token from forgotPassword (public)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };

    if (!token || !newPassword) {
      res.status(400).json({ message: 'token and newPassword are required' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: 'New password must be at least 8 characters' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const doctor = await Doctor.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!doctor) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    doctor.password = newPassword;
    doctor.resetPasswordToken = undefined;
    doctor.resetPasswordExpires = undefined;
    await doctor.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
