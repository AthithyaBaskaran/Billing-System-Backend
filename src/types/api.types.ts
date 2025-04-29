export interface ApiResponse<T = any> {
  statusCode: number;
  statusMessage?: string;
  message?: string;
  data: T;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  loyaltyPoints?: number;
  // Add any other fields that are returned by the API
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  email: string;
  token: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface PasswordResetRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  loading: boolean;
  error: string | null;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sku?: string;
  stockQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}