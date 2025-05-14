
export type UserRole = "agent" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}
