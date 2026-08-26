import { apiRequest } from './client';
import { AuthUser } from '../types/domain';

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Sends a registration request and returns the authentication token and user. */
export function register(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: { email, password } });
}

/** Sends login credentials and returns the authentication token and user. */
export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}
