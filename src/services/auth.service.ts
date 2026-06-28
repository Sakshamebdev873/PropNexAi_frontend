import api from '@/config/api';
import type { ApiResponse, AuthResponse, User } from '@/types';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(input: LoginInput) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', input);
    return data.data;
  },

  async register(input: RegisterInput) {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', input);
    return data.data;
  },

  async getMe() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
