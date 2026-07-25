export const PERMISSION_KEYS = [
  'canManageOrganization',
  'canManageDoctors',
  'canViewAllPatients',
  'canManageBilling',
  'canViewAllCalendars',
  'canManageBranding',
  'canManageTeamProfiles',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type PermissionsMap = Record<PermissionKey, boolean>;

type Role = 'owner' | 'admin' | 'member';

const OWNER_BASELINE: PermissionsMap = PERMISSION_KEYS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {} as PermissionsMap);

const ADMIN_BASELINE: Partial<PermissionsMap> = {
  canManageDoctors: true,
  canViewAllPatients: true,
};

/**
 * Permissions are computed at read time instead of persisted-and-forced by a
 * save hook. A granted permission is additive over the role baseline — a
 * baseline permission (e.g. an admin's canManageDoctors) can't be revoked
 * without changing the role. This also means role changes take effect
 * immediately, even when applied via findOneAndUpdate (which bypasses
 * Mongoose document middleware entirely).
 */
export function effectivePermissions(doctor: {
  role: Role;
  permissions?: Partial<Record<PermissionKey, boolean>>;
}): PermissionsMap {
  const baseline: Partial<PermissionsMap> =
    doctor.role === 'owner' ? OWNER_BASELINE : doctor.role === 'admin' ? ADMIN_BASELINE : {};

  const result = {} as PermissionsMap;
  for (const key of PERMISSION_KEYS) {
    result[key] = Boolean(baseline[key] || doctor.permissions?.[key]);
  }
  return result;
}

export function isValidPermissionKey(key: string): key is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(key);
}
