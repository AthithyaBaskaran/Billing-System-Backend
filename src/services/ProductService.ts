import axios from 'axios';

// Define the Product interface
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category?: string;
  barcode?: string;
}

// Define the API response interface for product service
export interface ApiResponse {
  statusCode: number;
  statusMessage: string;
  data: any;
}

// Get the API base URL from the authApi file or use a default
const API_BASE_URL = 'http://localhost:8091/api'; // Match the same base URL as authApi
const API_URL = `${API_BASE_URL}/products`;

// Check if token exists and set it in the headers
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const ProductService = {
  // Create a new product
  createProduct: async (product: Product): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>(API_URL, product);
      console.log('Create product response:', response.data);
      
      // If the response is an ApiResponse object
      if (response.data && typeof response.data === 'object') {
        if (response.data.statusCode && response.data.statusMessage) {
          // This is a properly formatted API response
          return response.data;
        }
        
        // If the response is the product object itself (not wrapped in ApiResponse)
        const productData = response.data as unknown as Product;
        if (productData.id && productData.name) {
          return {
            statusCode: 201,
            statusMessage: 'Product created successfully',
            data: productData
          };
        }
      }
      
      // Default successful response
      return {
        statusCode: 201,
        statusMessage: 'Product created successfully',
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error    .response) {
        console.error('Product creation error:', error.response.data);
        // Return a properly formatted error response
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to create product',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(API_URL);
      console.log('Get all products response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },
  
  // Search products by name
  searchProductsByName: async (name: string): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/search?name=${encodeURIComponent(name)}`);
      console.log(`Search products by name "${name}" response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error searching products by name "${name}":`, error);
      throw error;
    }
  },
  
  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/category/${encodeURIComponent(category)}`);
      console.log(`Get products by category "${category}" response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching products by category "${category}":`, error);
      throw error;
    }
  },
  
  // Get low stock products
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/low-stock?threshold=${threshold}`);
      console.log(`Get low stock products (threshold: ${threshold}) response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching low stock products (threshold: ${threshold}):`, error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/${id}`);
      console.log(`Get product by ID ${id} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product by ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get product by barcode
  getProductByBarcode: async (barcode: string): Promise<Product> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/barcode/${barcode}`);
      console.log(`Get product by barcode ${barcode} response:`, response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product by barcode ${barcode}:`, error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id: number, product: Product): Promise<ApiResponse> => {
    try {
      const response = await axios.put<ApiResponse>(`${API_URL}/${id}`, product);
      console.log('Update product response:', response.data);
      
      // If the response is an ApiResponse object
      if (response.data && typeof response.data === 'object') {
        if (response.data.statusCode && response.data.statusMessage) {
          // This is a properly formatted API response
          return response.data;
        }
        
        // If the response is the product object itself (not wrapped in ApiResponse)
        const productData = response.data as unknown as Product;
        if (productData.id && productData.name) {
          return {
            statusCode: 200,
            statusMessage: 'Product updated successfully',
            data: productData
          };
        }
      }
      
      // Default successful response
      return {
        statusCode: 200,
        statusMessage: 'Product updated successfully',
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Product update error:', error.response.data);
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to update product',
          data: error.response.data.errors || error.response.data
        };
      }
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/${id}`);
      console.log(`Delete product ${id} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          statusCode: error.response.status,
          statusMessage: error.response.data.message || 'Failed to delete product',
          data: null
        };
      }
      throw error;
    }
  }
};

export default ProductService;