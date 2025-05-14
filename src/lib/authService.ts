import type { User, UserRole } from '@/types/auth';

// Mock database of users
const mockUsers: User[] = [
  { id: '1', email: 'admin@freightwise.com', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'agent@freightwise.com', name: 'Agent User', role: 'agent' },
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

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  await delay(300);
  const newUser: User = { ...userData, id: String(mockUsers.length + 1) };
  mockUsers.push(newUser); // This is a mock mutation, data won't persist across sessions
  return newUser;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  await delay(300);
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
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
