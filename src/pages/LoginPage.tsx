import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Link, 
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Card,
  Grid,
  Checkbox,
  FormControlLabel,
  Slide,
  Fade
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types/api.types';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

// Define interface for form errors
interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { authState, login } = useAuth();
  const navigate = useNavigate();
  
  // State for form values
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  // State for form validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // State for remember me
  const [rememberMe, setRememberMe] = useState(false);
  
  // Animation states
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Set page loaded state for animations
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  // Handle remember me toggle
  const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login({
          email: formData.email,
          password: formData.password
        });
        
        // If login is successful, redirect to success page
        navigate('/login-success');
      } catch (error) {
        // Error handling is done in the context
        console.error('Login submission error:', error);
      }
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
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* Left side - Brand/Image */}
            <Box
              sx={{
                flex: { md: '1 0 50%' },
                position: 'relative',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 6,
                overflow: 'hidden'
              }}
            >
              <Slide direction="right" in={pageLoaded} timeout={1000}>
                <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 400 }}>
                  <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    Welcome Back!
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Sign in to access your account and manage your billing system.
                  </Typography>
                  <Box sx={{ mt: 4, display: { xs: 'none', sm: 'block' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <LoginIcon />
                      </Box>
                      <Typography variant="body1">
                        Secure and easy login process
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <LockIcon />
                      </Box>
                      <Typography variant="body1">
                        Protected with end-to-end encryption
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Slide>
              
              {/* Decorative circles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 1
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 1
                }}
              />
            </Box>
            
            {/* Right side - Login Form */}
            <Box
              sx={{
                flex: { md: '1 0 50%' },
                p: { xs: 3, sm: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Slide direction="left" in={pageLoaded} timeout={1000}>
                <Box>
                  <Typography
                    variant="h4"
                    component="h2"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                    sx={{ mb: 3 }}
                  >
                    Sign In
                  </Typography>
                  
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
                  
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      margin="normal"
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
                          },
                          transition: 'background-color 0.3s'
                        }
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.common.black, 0.02),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.common.black, 0.03),
                          },
                          transition: 'background-color 0.3s'
                        }
                      }}
                      sx={{ mb: 1 }}
                    />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                      mt: 1
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                            color="primary"
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">Remember me</Typography>
                        }
                      />
                      <Link 
                        component={RouterLink} 
                        to="/forgot-password"
                        variant="body2"
                        sx={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={authState.loading}
                      sx={{ 
                        py: 1.5, 
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
                        'Sign In'
                      )}
                    </Button>
                    
                    <Box sx={{ mt: 3, mb: 3 }}>
                      <Divider>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ px: 1 }}
                        >
                          Or continue with
                        </Typography>
                      </Divider>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
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
                      <Grid item xs={4}>
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
                      <Grid item xs={4}>
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
                    
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/signup"
                          sx={{ 
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Sign up now
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Card>
        </Container>
      </Fade>
    </Box>
  );
};

export default LoginPage;