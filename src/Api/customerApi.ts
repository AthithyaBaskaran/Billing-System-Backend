import axios from 'axios';
import { ApiResponse, Customer } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8091/api'; // Adjust this to your backend URL

export const customerApi = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await axios.get<ApiResponse<Customer[]>>(`${API_BASE_URL}/customers`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse<Customer>>(`${API_BASE_URL}/customers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Get customer by email
  getCustomerByEmail: async (email: string): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse<Customer>>(`${API_BASE_URL}/customers/email/${email}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer with email ${email}:`, error);
      throw error;
    }
  },

  // Get customer by phone
  getCustomerByPhone: async (phone: string): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse<Customer>>(`${API_BASE_URL}/customers/phone/${phone}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer with phone ${phone}:`, error);
      throw error;
    }
  },

  // Search customers by first name
  searchCustomersByFirstName: async (firstName: string): Promise<Customer[]> => {
    try {
      const response = await axios.get<ApiResponse<Customer[]>>(
        `${API_BASE_URL}/customers/search?firstName=${encodeURIComponent(firstName)}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error searching customers with first name ${firstName}:`, error);
      throw error;
    }
  },

  // Get customers with loyalty points above a threshold
  getCustomersWithLoyaltyPointsAbove: async (points: number = 100): Promise<Customer[]> => {
    try {
      const response = await axios.get<ApiResponse<Customer[]>>(
        `${API_BASE_URL}/customers/loyalty?points=${points}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customers with loyalty points above ${points}:`, error);
      throw error;
    }
  },

  // Update customer loyalty points
  updateCustomerLoyaltyPoints: async (id: number, points: number): Promise<Customer> => {
    try {
      const response = await axios.patch<ApiResponse<Customer>>(
        `${API_BASE_URL}/customers/${id}/loyalty-points?points=${points}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating loyalty points for customer ${id}:`, error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id: number, customerData: Customer): Promise<Customer> => {
    try {
      const response = await axios.put<ApiResponse<Customer>>(
        `${API_BASE_URL}/customers/${id}`,
        customerData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // Create new customer
  saveCustomer: async (customerData: Customer): Promise<Customer> => {
    try {
      const response = await axios.post<ApiResponse<Customer>>(
        `${API_BASE_URL}/customers`,
        customerData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating new customer:', error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id: number): Promise<void> => {
    try {
      await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/customers/${id}`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }
};