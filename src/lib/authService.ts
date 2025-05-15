
'use server';
import type { User, UserRole, UserPermissions, PermissionAction, FeatureScope } from '@/types/auth';
import { query, toCamelCase } from './db';
import crypto from 'crypto'; // For generating UUIDs

// IMPORTANT: This service currently stores/compares passwords in plaintext.
// In a production environment, passwords MUST be securely hashed (e.g., using bcrypt).

const ALL_ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const getDefaultPermissions = (role: UserRole): UserPermissions => {
  if (role === 'admin') {
    return {
      prices: [...ALL_ACTIONS],
      users: [...ALL_ACTIONS],
      announcements: [...ALL_ACTIONS],
      rfqs: [...ALL_ACTIONS],
    };
  }
  return { // Agent defaults
    prices: ['view'],
    users: [],
    announcements: ['view'],
    rfqs: ['view', 'create'],
  };
};

export const login = async (email: string, pass: string): Promise<User | null> => {
  try {
    // TODO: Implement password hashing and comparison here.
    // For now, comparing plaintext password (NOT SECURE FOR PRODUCTION).
    const { rows } = await query('SELECT * FROM users WHERE email = $1 AND password_hash = $2', [email, pass]);
    if (rows.length > 0) {
      const user = toCamelCase<User>(rows[0]);
      // Ensure permissions is an object. PG returns JSONB as string if not parsed, or object if parsed.
      // Type from DB will be `passwordHash`, not `password`
      if (typeof user.permissions === 'string') {
          user.permissions = JSON.parse(user.permissions as unknown as string);
      }
      
      // Client-side session management (for UI updates)
      if (typeof window !== 'undefined') {
        localStorage.setItem('freightwise_user', JSON.stringify(user));
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('freightwise_user');
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('freightwise_user');
  if (userData) {
    const user = JSON.parse(userData) as User;
    // Ensure permissions is an object, it might be stringified in localStorage
    if (typeof user.permissions === 'string') {
        user.permissions = JSON.parse(user.permissions);
    }
    return user;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { rows } = await query('SELECT id, email, name, role, permissions FROM users ORDER BY name');
    return rows.map(row => {
        const user = toCamelCase<User>(row);
        if (typeof user.permissions === 'string') {
            user.permissions = JSON.parse(user.permissions as unknown as string);
        }
        return user;
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const { email, name, password, role, permissions } = userData;
  const newId = crypto.randomUUID();
  // TODO: Hash the password before storing it. Storing plaintext password (NOT SECURE).
  const userPermissions = permissions || getDefaultPermissions(role);

  try {
    const { rows } = await query(
      'INSERT INTO users (id, email, name, password_hash, role, permissions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newId, email, name, password, role, JSON.stringify(userPermissions)] // password should be password_hash
    );
    const newUser = toCamelCase<User>(rows[0]);
    if (typeof newUser.permissions === 'string') {
        newUser.permissions = JSON.parse(newUser.permissions as unknown as string);
    }
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id' | 'email'>>): Promise<User | null> => {
  const { name, role, permissions, password } = updates; // password might be undefined

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (role !== undefined) {
    setClauses.push(`role = $${paramIndex++}`);
    values.push(role);
    // If role is updated and permissions are not explicitly set, update permissions based on new role
    if (permissions === undefined) {
        setClauses.push(`permissions = $${paramIndex++}`);
        values.push(JSON.stringify(getDefaultPermissions(role)));
    }
  }
  if (permissions !== undefined) {
    setClauses.push(`permissions = $${paramIndex++}`);
    values.push(JSON.stringify(permissions));
  }
  if (password !== undefined) {
    // TODO: Hash the password before storing it.
    setClauses.push(`password_hash = $${paramIndex++}`);
    values.push(password);
  }

  if (setClauses.length === 0) {
    // No updates provided, fetch and return current user data
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
     if (rows.length > 0) {
        const user = toCamelCase<User>(rows[0]);
        if (typeof user.permissions === 'string') {
            user.permissions = JSON.parse(user.permissions as unknown as string);
        }
        return user;
     }
     return null;
  }

  values.push(userId); // For WHERE id = $N

  try {
    const { rows } = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (rows.length > 0) {
      const updatedUser = toCamelCase<User>(rows[0]);
      if (typeof updatedUser.permissions === 'string') {
          updatedUser.permissions = JSON.parse(updatedUser.permissions as unknown as string);
      }
      return updatedUser;
    }
    return null;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { rowCount } = await query('DELETE FROM users WHERE id = $1', [userId]);
    return rowCount !== null && rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
