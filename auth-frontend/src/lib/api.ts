import { API_BASE_URL } from '../config';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  authenticated: boolean;
  token: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

interface RegisterResponse {
  user: {
    id: number;
    email: string;
    username: string;
  };
  authenticated: boolean;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface MessageResponse {
  message: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
