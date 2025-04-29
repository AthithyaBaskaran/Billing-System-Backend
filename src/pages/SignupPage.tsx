import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert,
  CircularProgress,
  Card,
  Grid,
  Divider,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Chip,
  InputAdornment
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/AuthContext';
import { TextInput, AutocompleteField } from '../components/common/FormFields';
import { signupSchema, SignupFormData } from '../utils/validationSchemas';
import { commonAddresses } from '../utils/addressData';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const SignupPage: React.FC = () => {
  const theme = useTheme();
  const [successMessage, setSuccessMessage] = useState('');
  const { authState, signup } = useAuth();
  const navigate = useNavigate();
  
  // Animation states
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Multi-step form state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Information', 'Account Security', 'Contact Details'];
  
  // Address options for autocomplete
  const addressOptions = useMemo(() => commonAddresses, []);

  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit: handleFormSubmit,
    formState: { errors, isValid, dirtyFields },
    trigger,
    getValues,
    watch
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
    mode: 'onChange'
  });
  
  // Set page loaded state for animations
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  
  // Watch form values for validation
  const watchedValues = watch();
  
  // Handle step navigation
  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    // Determine which fields to validate based on current step
    if (activeStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'email'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['password', 'confirmPassword'];
    }
    
    // Validate the fields for the current step
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Check if current step is valid
  const isStepValid = () => {
    if (activeStep === 0) {
      return !!dirtyFields.firstName && !!dirtyFields.lastName && !!dirtyFields.email && 
        !errors.firstName && !errors.lastName && !errors.email;
    } else if (activeStep === 1) {
      return !!dirtyFields.password && !!dirtyFields.confirmPassword && 
        !errors.password && !errors.confirmPassword;
    } else if (activeStep === 2) {
      return !!dirtyFields.phone && !!dirtyFields.address && 
        !errors.phone && !errors.address;
    }
    return false;
  };

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        py: 4
      }}
    >
      <Fade in={pageLoaded} timeout={800}>
        <Container maxWidth="lg">
          <Card
            elevation={8}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            <Grid component="div" container>
              {/* Header */}
              <Grid component="div" item xs={12}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    p: { xs: 3, md: 4 },
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Slide direction="down" in={pageLoaded} timeout={1000}>
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Create Your Account
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                        Join our platform to manage your billing system efficiently and securely.
                      </Typography>
                      
                      {/* Stepper */}
                      <Box sx={{ mt: 4 }}>
                        <Stepper 
                          activeStep={activeStep} 
                          alternativeLabel
                          sx={{ 
                            '& .MuiStepLabel-label': { 
                              color: 'white', 
                              opacity: 0.8,
                              mt: 1,
                              '&.Mui-active': { 
                                color: 'white', 
                                opacity: 1,
                                fontWeight: 'bold'
                              }
                            },
                            '& .MuiStepIcon-root': { 
                              color: 'rgba(255, 255, 255, 0.5)',
                              '&.Mui-active': { color: 'white' },
                              '&.Mui-completed': { color: '#4caf50' }
                            }
                          }}
                        >
                          {steps.map((label, index) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>
                    </Box>
                  </Slide>
                  
                  {/* Decorative circles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      zIndex: 1
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: '50%',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      zIndex: 1
                    }}
                  />
                </Box>
              </Grid>
              
              {/* Form Content */}
              <Grid component="div" item xs={12}>
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                  {/* Error and Success Messages */}
                  {authState.error && (
                    <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                      }}
                    >
                      {authState.error}
                    </Alert>
                  )}
                  
                  {successMessage && (
                    <Alert 
                      severity="success" 
                      variant="filled"
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                      }}
                    >
                      {successMessage}
                    </Alert>
                  )}
                  
                  {/* Form Steps */}
                  <Box component="form" onSubmit={handleFormSubmit(onSubmit)} noValidate>
                    {/* Step 1: Personal Information */}
                    <Fade in={activeStep === 0} timeout={500}>
                      <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <PersonIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                          <Typography variant="h5" fontWeight="medium" color="primary.main">
                            Personal Information
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Please provide your basic information to get started.
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                          <Grid component="div" item xs={12} sm={6}>
                            <TextInput
                              name="firstName"
                              control={control}
                              label="First Name"
                              error={!!errors.firstName}
                              helperText={errors.firstName?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid component="div" item xs={12} sm={6}>
                            <TextInput
                              name="lastName"
                              control={control}
                              label="Last Name"
                              error={!!errors.lastName}
                              helperText={errors.lastName?.message}
                              InputProps={{
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid component="div" item xs={12}>
                            <TextInput
                              name="email"
                              control={control}
                              label="Email Address"
                              error={!!errors.email}
                              helperText={errors.email?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Fade>
                    
                    {/* Step 2: Account Security */}
                    <Fade in={activeStep === 1} timeout={500}>
                      <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <SecurityIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                          <Typography variant="h5" fontWeight="medium" color="primary.main">
                            Account Security
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Create a strong password to secure your account.
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                          <Grid component="div" item xs={12} sm={6}>
                            <TextInput
                              name="password"
                              control={control}
                              label="Password"
                              type="password"
                              error={!!errors.password}
                              helperText={errors.password?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid component="div" item xs={12} sm={6}>
                            <TextInput
                              name="confirmPassword"
                              control={control}
                              label="Confirm Password"
                              type="password"
                              error={!!errors.confirmPassword}
                              helperText={errors.confirmPassword?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid component="div" item xs={12}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                              }}
                            >
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Password Requirements:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                <Chip 
                                  size="small" 
                                  icon={<CheckCircleIcon />} 
                                  label="At least 6 characters" 
                                  color={watchedValues.password?.length >= 6 ? "success" : "default"}
                                  variant={watchedValues.password?.length >= 6 ? "filled" : "outlined"}
                                />
                                <Chip 
                                  size="small" 
                                  icon={<CheckCircleIcon />} 
                                  label="One uppercase letter" 
                                  color={/[A-Z]/.test(watchedValues.password || '') ? "success" : "default"}
                                  variant={/[A-Z]/.test(watchedValues.password || '') ? "filled" : "outlined"}
                                />
                                <Chip 
                                  size="small" 
                                  icon={<CheckCircleIcon />} 
                                  label="One number" 
                                  color={/[0-9]/.test(watchedValues.password || '') ? "success" : "default"}
                                  variant={/[0-9]/.test(watchedValues.password || '') ? "filled" : "outlined"}
                                />
                              </Box>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    </Fade>
                    
                    {/* Step 3: Contact Details */}
                    <Fade in={activeStep === 2} timeout={500}>
                      <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <VerifiedUserIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                          <Typography variant="h5" fontWeight="medium" color="primary.main">
                            Contact Details
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Provide your contact information to complete your profile.
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                          <Grid component="div" item xs={12}>
                            <TextInput
                              name="phone"
                              control={control}
                              label="Phone Number"
                              error={!!errors.phone}
                              helperText={errors.phone?.message || "Enter a 10-15 digit phone number"}
                              placeholder="e.g., 1234567890"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="action" />
                                  </InputAdornment>
                                ),
                                sx: { 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.common.black, 0.02),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.common.black, 0.03),
                                  }
                                }
                              }}
                            />
                          </Grid>
                          <Grid component="div" item xs={12}>
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
                              helperText={errors.address?.message as string | undefined}
                              placeholder="Start typing to search addresses..."
                              autocompleteProps={{
                                freeSolo: true,
                                autoComplete: true,
                                autoHighlight: true
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Fade>
                    
                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        startIcon={<ArrowBackIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          visibility: activeStep === 0 ? 'hidden' : 'visible'
                        }}
                      >
                        Back
                      </Button>
                      
                      {activeStep === steps.length - 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={authState.loading || !isStepValid()}
                          sx={{ 
                            py: 1.2, 
                            px: 4,
                            borderRadius: 2,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              boxShadow: '0 12px 20px rgba(25, 118, 210, 0.4)',
                            }
                          }}
                        >
                          {authState.loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Complete Registration'
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon />}
                          disabled={!isStepValid()}
                          sx={{ 
                            py: 1.2, 
                            px: 3,
                            borderRadius: 2,
                            fontWeight: 'medium',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                            }
                          }}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                    
                    {/* Social Sign Up */}
                    {activeStep === 0 && (
                      <Box sx={{ mt: 4 }}>
                        <Divider sx={{ my: 3 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ px: 1 }}
                          >
                            Or sign up with
                          </Typography>
                        </Divider>
                        
                        <Grid container spacing={2}>
                          <Grid component="div" item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<GoogleIcon />}
                              sx={{ 
                                py: 1.2, 
                                borderRadius: 2,
                                borderColor: alpha('#DB4437', 0.5),
                                color: '#DB4437',
                                '&:hover': {
                                  borderColor: '#DB4437',
                                  bgcolor: alpha('#DB4437', 0.05)
                                }
                              }}
                            >
                              Google
                            </Button>
                          </Grid>
                          <Grid component="div" item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<FacebookIcon />}
                              sx={{ 
                                py: 1.2, 
                                borderRadius: 2,
                                borderColor: alpha('#4267B2', 0.5),
                                color: '#4267B2',
                                '&:hover': {
                                  borderColor: '#4267B2',
                                  bgcolor: alpha('#4267B2', 0.05)
                                }
                              }}
                            >
                              Facebook
                            </Button>
                          </Grid>
                          <Grid component="div" item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<TwitterIcon />}
                              sx={{ 
                                py: 1.2, 
                                borderRadius: 2,
                                borderColor: alpha('#1DA1F2', 0.5),
                                color: '#1DA1F2',
                                '&:hover': {
                                  borderColor: '#1DA1F2',
                                  bgcolor: alpha('#1DA1F2', 0.05)
                                }
                              }}
                            >
                              Twitter
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {/* Login Link */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/login"
                          sx={{ 
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Sign in
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Fade>
    </Box>
  );
};

export default SignupPage;