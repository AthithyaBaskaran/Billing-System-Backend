import axios from 'axios';
import { ApiResponse, Product } from '../types/api.types';

const API_URL = '/api/products';

export const productApi = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (product: Product): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}`, product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: number, product: Product): Promise<ApiResponse> => {
    try {
      const response = await axios.put<ApiResponse>(`${API_URL}/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/search?query=${query}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error searching products with query ${query}:`, error);
      throw error;
    }
  }
};