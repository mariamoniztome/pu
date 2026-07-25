import { useAuth } from '../contexts/AuthContext';
import { Doctor } from '../types/auth';

type PermissionKey = keyof Doctor['permissions'];

/**
 * Reads effectivePermissions (role baseline + granted flags, computed
 * server-side) when available, falling back to the raw stored permissions
 * for older cached sessions. Owner always passes regardless of what's
 * persisted, matching the backend's effectivePermissions() rule.
 */
export function usePermissions() {
  const { doctor } = useAuth();

  const can = (permission: PermissionKey): boolean => {
    if (!doctor) return false;
    if (doctor.role === 'owner') return true;
    return Boolean((doctor.effectivePermissions ?? doctor.permissions)[permission]);
  };

  return { can };
}
