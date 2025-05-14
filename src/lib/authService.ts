import type { User, UserRole, UserPermissions, PermissionAction, FeatureScope } from '@/types/auth';

const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

// Mock database of users
const mockUsers: User[] = [
  { 
    id: '1', 
    email: 'admin@freightwise.com', 
    name: 'Admin User', 
    role: 'admin',
    permissions: {
      prices: [...ALL_ACTIONS],
      users: [...ALL_ACTIONS],
      announcements: [...ALL_ACTIONS],
      rfqs: [...ALL_ACTIONS],
    }
  },
  { 
    id: '2', 
    email: 'agent@freightwise.com', 
    name: 'Agent User', 
    role: 'agent',
    permissions: {
      prices: ['view'],
      users: [],
      announcements: ['view'],
      rfqs: ['view'],
    }
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, _: string): Promise<User | null> => {
  await delay(500);
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    // In a real app, you'd set a session cookie or token here
    localStorage.setItem('freightwise_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem('freightwise_user');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null; // Ensure this runs only on client
  const userData = localStorage.getItem('freightwise_user');
  if (userData) {
    return JSON.parse(userData) as User;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  await delay(300);
  return mockUsers; // In a real app, this would be fetched from a backend
};

const getDefaultPermissions = (role: UserRole): UserPermissions => {
  if (role === 'admin') {
    return {
      prices: [...ALL_ACTIONS],
      users: [...ALL_ACTIONS],
      announcements: [...ALL_ACTIONS],
      rfqs: [...ALL_ACTIONS],
    };
  }
  // Default for 'agent'
  return {
    prices: ['view'],
    users: [],
    announcements: ['view'],
    rfqs: ['view', 'create'], // Agents might need to view and create RFQs if they are involved
  };
};

export const createUser = async (userData: Omit<User, 'id' | 'permissions'> & { permissions?: UserPermissions }): Promise<User> => {
  await delay(300);
  const newUser: User = { 
    ...userData, 
    id: String(mockUsers.length + 1),
    permissions: userData.permissions || getDefaultPermissions(userData.role) 
  };
  mockUsers.push(newUser); // This is a mock mutation, data won't persist across sessions
  return newUser;
};

export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id' | 'email'>> & { email?: string }): Promise<User | null> => {
  await delay(300);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    // Prevent email from being changed as it's usually an identifier
    const { email, ...safeUpdates } = updates; 
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...safeUpdates };
    if (updates.role && !updates.permissions) {
      // If role is updated and permissions are not explicitly set, update permissions based on new role
      mockUsers[userIndex].permissions = getDefaultPermissions(updates.role);
    }
    return mockUsers[userIndex];
  }
  return null;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  await delay(300);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    mockUsers.splice(userIndex, 1);
    return true;
  }
  return false;
};
