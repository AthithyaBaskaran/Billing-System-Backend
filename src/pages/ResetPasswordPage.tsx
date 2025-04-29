import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authApi } from '../Api/authApi';

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  // State for form values
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(true);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

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
    if (error) {
      setError(null);
    }
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  // Handle confirm password visibility toggle
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    if (validateForm()) {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authApi.resetPassword(
          token,
          formData.newPassword,
          formData.confirmPassword
        );
        setSuccess(true);
        console.log('Password reset successful:', response);
      } catch (err: any) {
        console.error('Password reset error:', err);
        
        // Handle different error formats
        let errorMessage = 'Failed to reset password. Please try again.';
        
        if (err.status === 403) {
          errorMessage = 'Access denied. The server is not allowing password reset requests.';
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.statusMessage) {
          errorMessage = err.response.data.statusMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
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
        <Container maxWidth="sm">
          <Card
            elevation={8}
            sx={{
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
              p: { xs: 3, sm: 6 }
            }}
          >
            <Slide direction="down" in={pageLoaded} timeout={1000}>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  Reset Password
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Enter your new password below to reset your account password.
                </Typography>
                
                {error && (
                  <Alert 
                    severity="error" 
                    variant="filled"
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                {success ? (
                  <Box>
                    <Alert 
                      severity="success" 
                      variant="filled"
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                      }}
                    >
                      Your password has been successfully reset. You can now log in with your new password.
                    </Alert>
                    <Button
                      component={RouterLink}
                      to="/login"
                      fullWidth
                      variant="contained"
                      color="primary"
                      sx={{ 
                        mt: 2, 
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Go to Login
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      autoComplete="new-password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
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
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
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
                              aria-label="toggle confirm password visibility"
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                      sx={{ mb: 3 }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={loading || !token}
                      sx={{ 
                        mt: 2, 
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                    
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="text"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Back to Login
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Slide>
          </Card>
        </Container>
      </Fade>
    </Box>
  );
};

export default ResetPasswordPage;