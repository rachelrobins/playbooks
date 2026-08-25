import { apiRequest } from './client';
import { AuthUser } from '../types/domain';

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function register(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: { email, password } });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}
