import axios from 'axios';
import { ApiResponse } from '../types/api.types';

// Make sure this matches the endpoint in your backend
const API_BASE_URL = 'http://localhost:8091/api'; // Match the same base URL as authApi
const API_URL = `${API_BASE_URL}/reports`;

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
}

export interface BusinessReport {
  totalRevenue: number;
  totalBills?: number;
  totalSales?: number;
  averageBillValue?: number;
  averageOrderValue?: number;
  customerCount?: number;
  newCustomersThisMonth?: number;
  topPerformingCategories?: {
    category: string;
    revenue: number;
    growth: number;
  }[];
  paymentMethodBreakdown?: {
    [method: string]: {
      count: number;
      amount: number;
    }
  };
  salesByDayOfWeek?: {
    [day: string]: number;
  };
  topSellingProducts?: ProductSalesSummary[];
  topCustomers?: CustomerSalesSummary[];
  salesByPeriod?: PeriodSales[];
  revenueByPeriod?: PeriodRevenue[];
}

export interface CustomerAnalytics {
  customerId: number;
  customerName: string;
  totalSpending: number;
  purchaseCount: number;
  averageBillAmount: number;
  mostPurchasedProducts: {
    productId: number;
    productName: string;
    purchaseCount: number;
  }[];
  monthlySpending: {
    [month: string]: number;
  };
  loyaltyPoints: number;
  customerRank: number;
}

export interface CustomerReportResponse {
  customerAnalytics: CustomerAnalytics[];
}

export interface CustomerReport {
  customerId: number;
  customerName: string;
  totalSpent?: number;
  totalSpending?: number;
  totalOrders?: number;
  purchaseCount?: number;
  averageOrderValue?: number;
  averageBillAmount?: number;
  lastOrderDate?: string;
  purchaseHistory?: PurchaseRecord[];
  mostPurchasedProducts?: {
    productId: number;
    productName: string;
    purchaseCount: number;
  }[];
  monthlySpending?: {
    [month: string]: number;
  };
  loyaltyPoints?: number;
  customerRank?: number;
}

export interface ProductReportResponse {
  topSellingByQuantity: {
    productId: number;
    productName: string;
    totalQuantitySold: number;
    percentageOfTotalSales: number;
  }[];
  topSellingByRevenue: {
    productId: number;
    productName: string;
    totalRevenue: number;
    percentageOfTotalRevenue: number;
  }[];
  categorySales: {
    category: string;
    totalSales: number;
    itemsSold: number;
  }[];
  monthlySalesTrend: {
    [month: string]: {
      totalSales: number;
      itemsSold: number;
    }
  };
  customerPreferences: {
    productId: number;
    productName: string;
    uniqueCustomers: number;
    repeatPurchaseRate: number;
  }[];
}

export interface ProductReport {
  productId: number;
  productName: string;
  totalSold?: number;
  totalRevenue?: number;
  averagePrice?: number;
  salesByPeriod?: PeriodSales[];
  
  // New fields from the API response
  totalQuantitySold?: number;
  percentageOfTotalSales?: number;
  percentageOfTotalRevenue?: number;
  category?: string;
  itemsSold?: number;
  uniqueCustomers?: number;
  repeatPurchaseRate?: number;
}

export interface ProductSalesSummary {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface CustomerSalesSummary {
  customerId: number;
  customerName: string;
  totalSpent: number;
  orderCount: number;
}

export interface PeriodSales {
  period: string;
  sales: number;
}

export interface PeriodRevenue {
  period: string;
  revenue: number;
}

export interface PurchaseRecord {
  date: string;
  billId: number;
  billNumber: string;
  amount: number;
  items: number;
}

const ReportService = {
  // Get all customers report
  getAllCustomersReport: async (filter?: ReportFilter): Promise<ApiResponse> => {
    try {
      let url = `${API_URL}/customers`;
      
      // Add query parameters if provided
      if (filter) {
        const params = new URLSearchParams();
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      console.log('Requesting customers report from:', url);
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Only reject if server error
      });
      
      // Check if response is JSON
      if (typeof response.data === 'string') {
        console.error('Received non-JSON response:', response.data);
        return {
          statusCode: 400,
          statusMessage: 'Invalid response format from server',
          data: null
        };
      }
      
      console.log('Get all customers report response:', response.data);
      
      // Handle the new response structure
      if (response.data.data && response.data.data.customerAnalytics) {
        // Transform the data to match the expected format
        const transformedData = {
          ...response.data,
          data: response.data.data.customerAnalytics
        };
        return transformedData;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all customers report:', error);
      return {
        statusCode: 500,
        statusMessage: 'Failed to connect to the server. Please try again later.',
        data: null
      };
    }
  },
  
  // Get customer report by ID
  getCustomerReport: async (customerId: number): Promise<ApiResponse> => {
    try {
      const url = `${API_BASE_URL}/customers/${customerId}`;
      console.log('Requesting customer report from:', url);
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Only reject if server error
      });
      
      // Check if response is JSON
      if (typeof response.data === 'string') {
        console.error('Received non-JSON response:', response.data);
        return {
          statusCode: 400,
          statusMessage: 'Invalid response format from server',
          data: null
        };
      }
      
      console.log(`Get customer ${customerId} report response:`, response.data);
      
      // First, check if we have a valid response with data
      if (response.data) {
        let customerData;
        
        // Case 1: Data is in response.data.data.customerAnalytics[0]
        if (response.data.data && response.data.data.customerAnalytics && 
            Array.isArray(response.data.data.customerAnalytics) && 
            response.data.data.customerAnalytics.length > 0) {
          customerData = response.data.data.customerAnalytics[0];
          console.log('Found customer data in response.data.data.customerAnalytics[0]:', customerData);
        } 
        // Case 2: Data is in response.data.customerAnalytics[0]
        else if (response.data.customerAnalytics && 
                Array.isArray(response.data.customerAnalytics) && 
                response.data.customerAnalytics.length > 0) {
          customerData = response.data.customerAnalytics[0];
          console.log('Found customer data in response.data.customerAnalytics[0]:', customerData);
        }
        // Case 3: Data is directly in response.data
        else if (response.data.customerId || (response.data.data && response.data.data.customerId)) {
          customerData = response.data.data || response.data;
          console.log('Found customer data directly in response:', customerData);
        }
        
        // If we found customer data in any format, transform it
        if (customerData) {
          // Transform the data to match the expected format
          const transformedData = {
            statusCode: response.data.statusCode || 200,
            statusMessage: response.data.statusMessage || 'Success',
            data: {
              customerId: customerData.customerId,
              customerName: customerData.customerName || `Customer ${customerData.customerId}`,
              totalSpending: customerData.totalSpending || customerData.totalSpent || 0,
              purchaseCount: customerData.purchaseCount || customerData.totalOrders || 0,
              averageBillAmount: customerData.averageBillAmount || customerData.averageOrderValue || 0,
              mostPurchasedProducts: customerData.mostPurchasedProducts || [],
              monthlySpending: customerData.monthlySpending || {},
              loyaltyPoints: customerData.loyaltyPoints || 0,
              customerRank: customerData.customerRank || null,
              lastOrderDate: customerData.lastOrderDate,
              purchaseHistory: customerData.purchaseHistory || []
            }
          };
          
          console.log('Transformed customer data:', transformedData);
          return transformedData;
        }
      }
      
      // If we reach here, we couldn't find customer data in any expected format
      console.log('No customer data found in response, returning original data');
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${customerId} report:`, error);
      return {
        statusCode: 500,
        statusMessage: `Failed to fetch report for customer ${customerId}. Please try again later.`,
        data: null
      };
    }
  },
  
  // Get all products report
  getAllProductsReport: async (filter?: ReportFilter): Promise<ApiResponse> => {
    try {
      let url = `${API_URL}/products`;
      
      // Add query parameters if provided
      if (filter) {
        const params = new URLSearchParams();
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      console.log('Requesting products report from:', url);
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Only reject if server error
      });
      
      // Check if response is JSON
      if (typeof response.data === 'string') {
        console.error('Received non-JSON response:', response.data);
        return {
          statusCode: 400,
          statusMessage: 'Invalid response format from server',
          data: null
        };
      }
      
      console.log('Get all products report response:', response.data);
      
      // Handle the new response structure
      if (response.data.data && response.data.data.topSellingByQuantity) {
        // Transform the data to match the expected format
        const transformedData = {
          ...response.data,
          data: response.data.data.topSellingByQuantity.map((product: any) => ({
            productId: product.productId,
            productName: product.productName,
            totalSold: product.totalQuantitySold,
            totalRevenue: response.data.data.topSellingByRevenue.find((p: any) => p.productId === product.productId)?.totalRevenue || 0,
            percentageOfTotalSales: product.percentageOfTotalSales,
            percentageOfTotalRevenue: response.data.data.topSellingByRevenue.find((p: any) => p.productId === product.productId)?.percentageOfTotalRevenue || 0
          }))
        };
        return transformedData;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all products report:', error);
      return {
        statusCode: 500,
        statusMessage: 'Failed to connect to the server. Please try again later.',
        data: null
      };
    }
  },
  
  // Get product report by ID
  getProductReport: async (productId: number): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/products/${productId}`;
      console.log('Requesting product report from:', url);
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Only reject if server error
      });
      
      // Check if response is JSON
      if (typeof response.data === 'string') {
        console.error('Received non-JSON response:', response.data);
        return {
          statusCode: 400,
          statusMessage: 'Invalid response format from server',
          data: null
        };
      }
      
      console.log(`Get product ${productId} report response:`, response.data);
      
      // Handle the new response structure
      if (response.data.data && 
          (response.data.data.topSellingByQuantity || 
           response.data.data.monthlySalesTrend || 
           response.data.data.customerPreferences)) {
        
        // Find the product in topSellingByQuantity
        const quantityData = response.data.data.topSellingByQuantity?.find((p: any) => p.productId === productId);
        
        // Find the product in topSellingByRevenue
        const revenueData = response.data.data.topSellingByRevenue?.find((p: any) => p.productId === productId);
        
        // Find the product in customerPreferences
        const customerData = response.data.data.customerPreferences?.find((p: any) => p.productId === productId);
        
        // Transform the data to match the expected format
        const transformedData = {
          ...response.data,
          data: {
            productId: productId,
            productName: quantityData?.productName || revenueData?.productName || customerData?.productName || 'Unknown',
            totalSold: quantityData?.totalQuantitySold || 0,
            totalRevenue: revenueData?.totalRevenue || 0,
            percentageOfTotalSales: quantityData?.percentageOfTotalSales || 0,
            percentageOfTotalRevenue: revenueData?.percentageOfTotalRevenue || 0,
            monthlySalesTrend: response.data.data.monthlySalesTrend || {},
            customerPreferences: response.data.data.customerPreferences || []
          }
        };
        
        return transformedData;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId} report:`, error);
      return {
        statusCode: 500,
        statusMessage: `Failed to fetch report for product ${productId}. Please try again later.`,
        data: null
      };
    }
  },
  
  // Get business report
  getBusinessReport: async (filter?: ReportFilter): Promise<ApiResponse> => {
    try {
      let url = `${API_URL}/business`;
      
      // Add query parameters if provided
      if (filter) {
        const params = new URLSearchParams();
        if (filter.startDate) params.append('startDate', filter.startDate);
        if (filter.endDate) params.append('endDate', filter.endDate);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      console.log('Requesting business report from:', url);
      
      const response = await axios.get<ApiResponse>(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Only reject if server error
      });
      
      // Check if response is JSON
      if (typeof response.data === 'string') {
        console.error('Received non-JSON response:', response.data);
        return {
          statusCode: 400,
          statusMessage: 'Invalid response format from server',
          data: null
        };
      }
      
      console.log('Get business report response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching business report:', error);
      return {
        statusCode: 500,
        statusMessage: 'Failed to connect to the server. Please try again later.',
        data: null
      };
    }
  }
};

export default ReportService;