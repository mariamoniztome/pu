import { Request } from 'express';

/**
 * Helper function to build organization filter for queries
 * Respects organization data sharing settings and doctor permissions
 */
export const buildOrganizationFilter = (req: Request, additionalFilter: any = {}): any => {
  const filter: any = {
    ...additionalFilter,
    organization: req.organization._id,
  };

  // If organization doesn't allow data sharing OR doctor doesn't have permission to view all patients
  if (!req.organization.settings.allowDataSharing || !req.doctor.permissions.canViewAllPatients) {
    filter.doctor = req.doctor._id;
  }

  return filter;
};

/**
 * Helper function to add organization and doctor to data being created
 */
export const addOrganizationContext = (req: Request, data: any): any => {
  return {
    ...data,
    organization: req.organization._id,
    doctor: req.doctor._id,
  };
};

/**
 * Helper function to sanitize update data (remove protected fields)
 */
export const sanitizeUpdateData = (data: any): any => {
  const sanitized = { ...data };
  delete sanitized.organization;
  delete sanitized.doctor;
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  return sanitized;
};
