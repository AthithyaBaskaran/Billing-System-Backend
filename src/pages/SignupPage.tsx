import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/AuthContext';
import { TextInput, AutocompleteField } from '../components/common/FormFields';
import { signupSchema, SignupFormData } from '../utils/validationSchemas';
import { commonAddresses } from '../utils/addressData';

const SignupPage: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const { authState, signup } = useAuth();
  const navigate = useNavigate();
  
  // Address options for autocomplete
  const addressOptions = useMemo(() => commonAddresses, []);

  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit: handleFormSubmit,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: ''
    },
    mode: 'onBlur'
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Format address if it's an object from autocomplete
      let formattedAddress = data.address;
      
      // Handle string that might be a stringified JSON object
      if (typeof data.address === 'string' && data.address.startsWith('{')) {
        try {
          const addressObj = JSON.parse(data.address);
          formattedAddress = addressObj.fullAddress || addressObj;
        } catch (e) {
          // If parsing fails, use the original string
          console.error('Error parsing address:', e);
        }
      } 
      // Handle direct object reference
      else if (typeof data.address === 'object' && data.address !== null) {
        formattedAddress = (data.address as any).fullAddress || '';
      }
      
      // Ensure address is a string
      if (typeof formattedAddress !== 'string') {
        formattedAddress = String(formattedAddress);
      }
      
      // Remove any quotes that might be present in the string
      formattedAddress = formattedAddress.replace(/^"(.*)"$/, '$1');
        
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: formattedAddress
      });
      
      // Show success message
      setSuccessMessage('Account created successfully!');
      
      // Redirect to signup success page
      navigate('/signup-success');
    } catch (error) {
      // Error handling is done in the context
      console.error('Signup submission error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create an Account
          </Typography>
          
          {authState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authState.error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleFormSubmit(onSubmit)} noValidate sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextInput
                    name="firstName"
                    control={control}
                    label="First Name"
                    required
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextInput
                    name="lastName"
                    control={control}
                    label="Last Name"
                    required
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Box>
              </Box>
              
              <TextInput
                name="email"
                control={control}
                label="Email Address"
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextInput
                    name="password"
                    control={control}
                    label="Password"
                    type="password"
                    required
                    error={!!errors.password}
                    helperText={errors.password?.message || "Must be at least 6 characters with 1 uppercase letter and 1 number"}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextInput
                    name="confirmPassword"
                    control={control}
                    label="Confirm Password"
                    type="password"
                    required
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </Box>
              </Box>
              
              <TextInput
                name="phone"
                control={control}
                label="Phone Number"
                required
                error={!!errors.phone}
                helperText={errors.phone?.message || "Enter a 10-15 digit phone number"}
                placeholder="e.g., 1234567890"
              />
              
              <AutocompleteField
                name="address"
                control={control}
                label="Address"
                required
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
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={authState.loading}
            >
              {authState.loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;