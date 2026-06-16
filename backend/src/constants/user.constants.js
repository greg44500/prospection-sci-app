/**
 * User Constants and Enums
 */

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  TEAM_MEMBER: 'team_member', // Pour future gestion multi-équipes
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

export const AuthProvider = {
  LOCAL: 'local',
  GOOGLE: 'google',
  // Pour futures intégrations
};

export const UserDefaults = {
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  emailVerified: false,
};

export default {
  UserRole,
  UserStatus,
  AuthProvider,
  UserDefaults,
};
