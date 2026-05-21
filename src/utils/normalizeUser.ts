import { User } from '../types';

/**
 * Normalize user role from object format { id: number, name: string }
 * to string format ('admin' | 'teacher' | 'parent' | 'student').
 *
 * The backend may return role as either a string or an object depending
 * on the endpoint; this helper ensures a consistent string format
 * throughout the frontend.
 */
export function normalizeUserRole(user: User): User {
  if (user.role && typeof user.role === 'object' && 'id' in user.role) {
    const roleId = (user.role as any).id;
    const roleMap: Record<number, User['role']> = {
      1: 'admin',
      2: 'teacher',
      3: 'parent',
      4: 'student',
    };
    return { ...user, role: roleMap[roleId] || 'student' };
  }
  return user;
}
