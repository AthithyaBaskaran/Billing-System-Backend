import axios from 'axios';
import { ApiResponse, LoginResponse, SignupRequest, LoginRequest } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8091/api'; // Adjust this to your backend URL

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(
        `${API_BASE_URL}/auth/login`, 
        credentials
      );
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupRequest): Promise<any> => {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/auth/signup`, 
        userData
      );
      return response.data.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Add this method to set the auth token for all future requests
  setAuthToken: (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }
};