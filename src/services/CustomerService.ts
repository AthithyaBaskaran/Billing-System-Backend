import axios from 'axios';

// Export the Customer interface
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
}

// Define the API response interface
export interface ApiResponse {
  statusCode: number;
  statusMessage: string;
  data: any;
}

// Get the API base URL from environment or use a default
const API_BASE_URL = 'http://localhost:8091/api';
const API_URL = `${API_BASE_URL}/customers`;

// Check if token exists and set it in the headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const CustomerService = {
  // Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await axios.get<ApiResponse>(API_URL);
      console.log('Get all customers response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);
      console.log(`Get customer by ID ${id} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer by ID ${id}:`, error);
      throw error;
    }
  },

  // Get customer by email
  getCustomerByEmail: async (email: string): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/email/${email}`);
      console.log(`Get customer by email ${email} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer by email ${email}:`, error);
      throw error;
    }
  },

  // Get customer by phone
  getCustomerByPhone: async (phone: string): Promise<Customer> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/phone/${phone}`);
      console.log(`Get customer by phone ${phone} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching customer by phone ${phone}:`, error);
      throw error;
    }
  },

  // Search customers by name
  searchCustomers: async (searchTerm: string): Promise<Customer[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/search?term=${encodeURIComponent(searchTerm)}`);
      console.log(`Search customers with term ${searchTerm} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error searching customers with term ${searchTerm}:`, error);
      throw error;
    }
  },

  // Create a new customer
  createCustomer: async (customer: Customer): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>(API_URL, customer);
      console.log('Create customer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to create customer',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Update a customer
  updateCustomer: async (id: number, customer: Customer): Promise<ApiResponse> => {
    try {
      const response = await axios.put<ApiResponse>(`${API_URL}/${id}`, customer);
      console.log(`Update customer ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to update customer',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Delete a customer
  deleteCustomer: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/${id}`);
      console.log(`Delete customer ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to delete customer',
          data: null
        };
      }
      throw error;
    }
  },

  // Update customer loyalty points
  updateLoyaltyPoints: async (id: number, points: number): Promise<ApiResponse> => {
    try {
      const response = await axios.patch<ApiResponse>(`${API_URL}/${id}/loyalty-points?points=${points}`);
      console.log(`Update loyalty points for customer ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating loyalty points for customer ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to update loyalty points',
          data: null
        };
      }
      throw error;
    }
  }
};

export default CustomerService;