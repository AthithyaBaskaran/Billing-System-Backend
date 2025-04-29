import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Grid, 
  Typography, 
  Alert, 
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextInput } from '../common/FormFields';
import { ProductService, Product } from '../../services/ProductService';

// Define validation schema for product form
const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price is required'),
  stockQuantity: yup.number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .required('Quantity is required'),
  category: yup.string().optional().nullable(),
  barcode: yup.string().optional().nullable(),
  id: yup.number().optional().nullable()
}).required();

// Define props for the component
interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  initialData?: Product;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSuccess, 
  initialData, 
  isEdit = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<Product>({
    resolver: yupResolver(productSchema) as any,
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      category: undefined,
      barcode: undefined
    }
  });

  // Handle form submission
  const onSubmit = async (data: Product) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      let response;
      
      if (isEdit && initialData?.id) {
        console.log('Updating product data:', data);
        response = await ProductService.updateProduct(initialData.id, data);
        console.log('Update API response:', response);
      } else {
        console.log('Submitting product data:', data);
        response = await ProductService.createProduct(data);
        console.log('Create API response:', response);
      }
      
      // Check if the response contains an error message
      if (response.statusCode >= 400) {
        // This is an error response
        const errorMessage = response.statusMessage || 'An error occurred';
        setError(errorMessage);
        
        // Show error notification
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
        
        return;
      }
      
      // This is a successful response
      const message = isEdit ? 'Product updated successfully' : 'Product created successfully';
      setSuccessMessage(message);
      
      // Show notification
      setNotification({
        open: true,
        message: message,
        severity: 'success'
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        // If the response contains product data, pass it to onSuccess
        if (response.data) {
          onSuccess(response.data);
        }
      }
      
      if (!isEdit) {
        // Reset form after successful creation
        reset();
      }
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = 'Failed to save product. Please try again.';
      setError(errorMessage);
      setSuccessMessage('');
      
      // Show error notification
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  
  return (
    <Card sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Product' : 'Create New Product'}
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              whiteSpace: 'pre-wrap'
            }
          }}
        >
          <Typography variant="body2" component="div">
            <strong>Error:</strong> {error}
          </Typography>
        </Alert>
      )}
      
      {successMessage && !error && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
        >
          {successMessage}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="name"
              control={control}
              label="Product Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextInput
              name="barcode"
              control={control}
              label="Barcode"
              error={!!errors.barcode}
              helperText={errors.barcode?.message}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextInput
              name="description"
              control={control}
              label="Description"
              error={!!errors.description}
              helperText={errors.description?.message}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextInput
              name="price"
              control={control}
              label="Price"
              error={!!errors.price}
              helperText={errors.price?.message}
              fullWidth
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextInput
              name="stockQuantity"
              control={control}
              label="Stock Quantity"
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity?.message}
              fullWidth
              type="number"
              inputProps={{ step: '1', min: '0' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextInput
              name="category"
              control={control}
              label="Category"
              error={!!errors.category}
              helperText={errors.category?.message}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEdit ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ProductForm;