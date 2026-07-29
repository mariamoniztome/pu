import { Request, Response } from 'express';
import fs from 'fs';
import Organization from '../models/Organization.js';
import { isGenuineImage } from '../middleware/upload.js';

const ORG_UPDATABLE_FIELDS = ['name', 'phone', 'address'] as const;
const ORG_SETTINGS_FIELDS = ['timezone', 'language', 'dateFormat', 'currency', 'allowDataSharing'] as const;

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates: Record<string, unknown> = {};
    for (const field of ORG_UPDATABLE_FIELDS) {
      if (field in req.body) updates[field] = req.body[field];
    }
    if (req.body.settings && typeof req.body.settings === 'object') {
      for (const field of ORG_SETTINGS_FIELDS) {
        if (field in req.body.settings) updates[`settings.${field}`] = req.body.settings[field];
      }
    }

    const organization = await Organization.findByIdAndUpdate(
      req.organization._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(400).json({ message: req.t('organization.updateFailed'), error: error.message });
  }
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const updateBranding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clinicName, primaryColor, accentColor } = req.body as {
      clinicName?: string;
      primaryColor?: string;
      accentColor?: string;
    };

    if (primaryColor !== undefined && primaryColor !== '' && !HEX_COLOR_RE.test(primaryColor)) {
      res.status(400).json({ message: req.t('organization.invalidPrimaryColorHex') });
      return;
    }
    if (accentColor !== undefined && accentColor !== '' && !HEX_COLOR_RE.test(accentColor)) {
      res.status(400).json({ message: req.t('organization.invalidAccentColorHex') });
      return;
    }

    const setOps: Record<string, unknown> = {};
    if (clinicName !== undefined) setOps['branding.clinicName'] = clinicName;
    if (primaryColor !== undefined) setOps['branding.primaryColor'] = primaryColor;
    if (accentColor !== undefined) setOps['branding.accentColor'] = accentColor;

    const organization = await Organization.findByIdAndUpdate(
      req.organization._id,
      { $set: setOps },
      { new: true, runValidators: true }
    );

    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(400).json({ message: req.t('organization.updateBrandingFailed'), error: error.message });
  }
};

export const uploadBrandingLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const variant = req.query.variant === 'mark' ? 'mark' : 'full';
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: req.t('common.noFileUploaded') });
      return;
    }

    if (!isGenuineImage(file.path)) {
      fs.unlinkSync(file.path);
      res.status(400).json({ message: req.t('common.invalidImageFile') });
      return;
    }

    const organization = await Organization.findById(req.organization._id);
    if (!organization) {
      fs.unlinkSync(file.path);
      res.status(404).json({ message: req.t('common.organizationNotFound') });
      return;
    }

    const field = variant === 'mark' ? 'logoMark' : 'logoFull';
    const previousPath = organization.branding?.[field];

    organization.branding = { ...organization.branding, [field]: file.path.replace(/\\/g, '/') };
    await organization.save();

    if (previousPath && fs.existsSync(previousPath)) {
      fs.unlinkSync(previousPath);
    }

    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(500).json({ message: req.t('organization.uploadLogoFailed'), error: error.message });
  }
};

export const deleteBrandingLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const variant = req.params.variant === 'mark' ? 'mark' : 'full';
    const field = variant === 'mark' ? 'logoMark' : 'logoFull';

    const organization = await Organization.findById(req.organization._id);
    if (!organization) {
      res.status(404).json({ message: req.t('common.organizationNotFound') });
      return;
    }

    const existingPath = organization.branding?.[field];
    if (existingPath && fs.existsSync(existingPath)) {
      fs.unlinkSync(existingPath);
    }

    if (organization.branding) {
      organization.branding[field] = undefined;
      await organization.save();
    }

    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(500).json({ message: req.t('organization.deleteLogoFailed'), error: error.message });
  }
};
