import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Customer } from '../../types/api.types';
import { customerApi } from '../../Api/customerApi';
import { TextInput, AutocompleteField } from '../common/FormFields';
import { customerSchema, CustomerFormData } from '../../utils/validationSchemas';
import { AddressOption, commonAddresses } from '../../utils/addressData';

interface CustomerEditFormProps {
  customerId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerEditForm: React.FC<CustomerEditFormProps> = ({ 
  customerId, 
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Address options for autocomplete
  const addressOptions = useMemo(() => commonAddresses, []);

  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit: handleFormSubmit, 
    reset,
    formState: { errors }
  } = useForm<CustomerFormData>({
    resolver: yupResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      loyaltyPoints: 0 as number | null
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        const data = await customerApi.getCustomerById(customerId);
        // Reset form with fetched data
        reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : null
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch customer details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      
      // Format address if it's an object from autocomplete
      let formattedAddress: string = '';
      
      if (typeof data.address === 'object' && data.address !== null) {
        // Handle object with fullAddress property
        formattedAddress = (data.address as unknown as AddressOption).fullAddress || '';
      } else if (typeof data.address === 'string') {
        // Handle string directly
        formattedAddress = data.address;
      } else if (data.address !== null && data.address !== undefined) {
        // Handle any other type by converting to string
        formattedAddress = String(data.address);
      }
      
      const customerData: Customer = {
        id: customerId || 0,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: formattedAddress,
        loyaltyPoints: data.loyaltyPoints !== null ? data.loyaltyPoints : 0
      };
      
      if (customerId) {
        // Update existing customer
        await customerApi.updateCustomer(customerId, customerData);
      } else {
        // Create new customer
        await customerApi.saveCustomer(customerData);
      }
      
      // Call onSuccess callback
      onSuccess();
      
      // Navigate to success page
      const customerName = `${data.firstName} ${data.lastName}`;
      navigate('/customer-success', { 
        state: { 
          operation: customerId ? 'update' : 'create',
          customerName: customerName
        } 
      });
    } catch (err) {
      console.error('Error saving customer:', err);
      setNotification({
        open: true,
        message: `Failed to ${customerId ? 'update' : 'create'} customer. Please try again.`,
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading && !customerId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {customerId ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        <IconButton 
          aria-label="close" 
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleFormSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="firstName"
              control={control}
              label="First Name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="lastName"
              control={control}
              label="Last Name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="email"
              control={control}
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="phone"
              control={control}
              label="Phone"
              placeholder="e.g., 1234567890"
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <AutocompleteField
              name="address"
              control={control}
              label="Address"
              options={addressOptions}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : option.fullAddress
              }
              isOptionEqualToValue={(option, value) => 
                option.id === value.id
              }
              error={!!errors.address}
              helperText={errors.address?.message}
              placeholder="Start typing to search addresses..."
              autocompleteProps={{
                freeSolo: true,
                autoComplete: true,
                autoHighlight: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              name="loyaltyPoints"
              control={control}
              label="Loyalty Points"
              type="text"
              error={!!errors.loyaltyPoints}
              helperText={errors.loyaltyPoints?.message || "Leave empty for default (0)"}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={onClose}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : customerId ? 'Update Customer' : 'Add Customer'}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        message={notification.message}
      />
    </Paper>
  );
};

export default CustomerEditForm;