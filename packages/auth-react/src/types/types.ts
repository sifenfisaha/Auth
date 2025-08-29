export interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;

  requestVerification: (email: string) => Promise<void>;
  confirmVerification: (otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (otp: string, newPassword: string) => Promise<void>;
}
