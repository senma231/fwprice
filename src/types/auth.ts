
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type FeatureScope = 'prices' | 'users' | 'announcements' | 'rfqs';

export type UserPermissions = {
  [key in FeatureScope]?: PermissionAction[];
};

export type UserRole = "agent" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  permissions: UserPermissions;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // TODO: Consider adding a helper hasPermission(scope: FeatureScope, action: PermissionAction) => boolean;
}

