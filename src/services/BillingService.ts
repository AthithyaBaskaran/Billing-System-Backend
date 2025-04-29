import axios from 'axios';
import { Customer } from './CustomerService';

// Define the Bill interface
export interface Bill {
  id?: number;
  billNumber: string;
  customer: Customer;
  billDate: string;
  dueDate?: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the BillItem interface (for frontend use)
export interface BillItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

// Define the API BillItem interface (for the API request)
export interface ApiBillItem {
  product: {
    id: number
  };
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

// Define the API response BillItem interface (from the API response)
export interface ApiResponseBillItem {
  id: number;
  product: {
    id: number;
    name: string | null;
    description: string | null;
    price: number | null;
    stockQuantity: number | null;
    barcode: string | null;
    category: string | null;
  };
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

// Define the API response interface
export interface ApiResponse {
  statusCode: number;
  statusMessage: string;
  data: any;
}

// Get the API base URL from environment or use a default
const API_BASE_URL = 'http://localhost:8091/api';
const API_URL = `${API_BASE_URL}/bills`;

// Check if token exists and set it in the headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const BillingService = {
  // Get all bills
  getAllBills: async (): Promise<Bill[]> => {
    try {
      const response = await axios.get<ApiResponse>(API_URL);
      console.log('Get all bills response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all bills:', error);
      throw error;
    }
  },

  // Get bill by ID
  getBillById: async (id: number): Promise<Bill> => {
    console.log(`BillingService - getBillById called with id: ${id}`);
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);
      console.log(`BillingService - Get bill by ID ${id} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`BillingService - Error fetching bill by ID ${id}:`, error);
      throw error;
    }
  },

  // Get bill by bill number
  getBillByNumber: async (billNumber: string): Promise<Bill> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/number/${billNumber}`);
      console.log(`Get bill by number ${billNumber} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bill by number ${billNumber}:`, error);
      throw error;
    }
  },

  // Get bills by customer ID
  getBillsByCustomer: async (customerId: number): Promise<Bill[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/customer/${customerId}`);
      console.log(`Get bills by customer ID ${customerId} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bills by customer ID ${customerId}:`, error);
      throw error;
    }
  },
  
  // Get bills by date range
  getBillsByDateRange: async (startDate: Date | string, endDate: Date | string): Promise<Bill[]> => {
    try {
      // Format dates to ISO format (YYYY-MM-DD)
      let formattedStartDate: string;
      let formattedEndDate: string;
      
      if (startDate instanceof Date) {
        formattedStartDate = startDate.toISOString().split('T')[0];
      } else {
        formattedStartDate = startDate;
      }
      
      if (endDate instanceof Date) {
        formattedEndDate = endDate.toISOString().split('T')[0];
      } else {
        formattedEndDate = endDate;
      }
      
      const response = await axios.get<ApiResponse>(
        `${API_URL}/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      console.log(`Get bills by date range response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bills by date range:`, error);
      throw error;
    }
  },
  
  // Get bills by payment method
  getBillsByPaymentMethod: async (paymentMethod: string): Promise<Bill[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/payment-method/${paymentMethod}`);
      console.log(`Get bills by payment method ${paymentMethod} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bills by payment method ${paymentMethod}:`, error);
      throw error;
    }
  },
  
  // Get bills by payment status
  getBillsByPaymentStatus: async (paymentStatus: string): Promise<Bill[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/payment-status/${paymentStatus}`);
      console.log(`Get bills by payment status ${paymentStatus} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bills by payment status ${paymentStatus}:`, error);
      throw error;
    }
  },

  // Create a new bill
  createBill: async (bill: Bill): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>(API_URL, bill);
      console.log('Create bill response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to create bill',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },
  
  // Create a bill with items only (for the new API endpoint)
  createBillWithItems: async (
    customerId: number, 
    items: ApiBillItem[], 
    paymentMethod: string
  ): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>(
        `${API_URL}?customerId=${customerId}&paymentMethod=${paymentMethod}`,
        items
      );
      console.log('Create bill with items response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill with items:', error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to create bill',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Update a bill
  updateBill: async (id: number, bill: Bill): Promise<ApiResponse> => {
    try {
      const response = await axios.put<ApiResponse>(`${API_URL}/${id}`, bill);
      console.log(`Update bill ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating bill ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to update bill',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Delete a bill
  deleteBill: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/${id}`);
      console.log(`Delete bill ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting bill ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to delete bill',
          data: null
        };
      }
      throw error;
    }
  },
  
  // Update bill payment status
  updateBillPaymentStatus: async (id: number, paymentStatus: string): Promise<Bill> => {
    try {
      console.log(`Updating bill ${id} payment status to ${paymentStatus}`);
      const response = await axios.patch<ApiResponse>(
        `${API_URL}/${id}/payment-status?paymentStatus=${paymentStatus}`
      );
      console.log(`Update bill payment status response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating bill payment status:`, error);
      throw error;
    }
  },
  
  // Generate customer invoice
  generateCustomerInvoice: async (customerId: number): Promise<ApiResponse> => {
    try {
      console.log(`Generating invoice for customer ${customerId}`);
      const response = await axios.get<ApiResponse>(
        `${API_URL}/invoice/customer/${customerId}`
      );
      console.log(`Generate customer invoice response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error generating customer invoice:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to generate invoice',
          data: null
        };
      }
      throw error;
    }
  },

  // Download bill as PDF
  downloadBillAsPdf: async (id: number): Promise<void> => {
    try {
      console.log(`Downloading bill ${id} as PDF`);
      
      // Use axios to get the PDF with responseType 'blob'
      const response = await axios.get(`${API_URL}/${id}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Create a blob URL from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${id}.pdf`);
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log(`Bill ${id} PDF download initiated`);
    } catch (error) {
      console.error(`Error downloading bill ${id} as PDF:`, error);
      throw error;
    }
  }
};

export default BillingService;