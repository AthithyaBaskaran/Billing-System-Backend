import axios from 'axios';

// API response interface
export interface ApiResponse {
  statusCode: number;
  statusMessage: string;
  data: any;
}

// Dashboard counts interface
export interface DashboardCounts {
  billCount?: number;
  productCount?: number;
  totalCount?: number;
  customerCount?: number;
  [key: string]: number | undefined;
}



// Base API URL
const API_BASE_URL = 'http://localhost:8091/api';
const API_URL = `${API_BASE_URL}/dashboard`;

// Set token in axios headers if available
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const DashboardService = {
  // Get dashboard counts
  getAllCounts: async (): Promise<DashboardCounts> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/counts`);
      console.log('Dashboard counts response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
      throw error;
    }
  },

};

export default DashboardService;
