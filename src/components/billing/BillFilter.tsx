import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Chip,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { BillingService, Bill } from '../../services/BillingService';

interface BillFilterProps {
  onBillsLoaded: (bills: Bill[]) => void;
}

const BillFilter: React.FC<BillFilterProps> = ({ onBillsLoaded }) => {
  // Date range state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
  // Payment status state
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle date range filter
  const handleDateRangeFilter = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bills = await BillingService.getBillsByDateRange(startDate, endDate);
      onBillsLoaded(bills);
    } catch (err) {
      console.error('Error filtering bills by date range:', err);
      setError('Failed to filter bills by date range');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle payment method filter
  const handlePaymentMethodFilter = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bills = await BillingService.getBillsByPaymentMethod(paymentMethod);
      onBillsLoaded(bills);
    } catch (err) {
      console.error('Error filtering bills by payment method:', err);
      setError('Failed to filter bills by payment method');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle payment status filter
  const handlePaymentStatusFilter = async () => {
    if (!paymentStatus) {
      setError('Please select a payment status');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bills = await BillingService.getBillsByPaymentStatus(paymentStatus);
      onBillsLoaded(bills);
    } catch (err) {
      console.error('Error filtering bills by payment status:', err);
      setError('Failed to filter bills by payment status');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset all filters and load all bills
  const handleResetFilters = async () => {
    setStartDate('');
    setEndDate('');
    setPaymentMethod('');
    setPaymentStatus('');
    setError(null);
    
    setLoading(true);
    
    try {
      const bills = await BillingService.getAllBills();
      onBillsLoaded(bills);
    } catch (err) {
      console.error('Error loading all bills:', err);
      setError('Failed to load all bills');
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  
  // Define custom colors for a cute and professional look
  const dateFilterBg = 'linear-gradient(135deg, #FFD3A5 0%, #FD6585 100%)';
  const methodFilterBg = 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)';
  const statusFilterBg = 'linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)';
  
  return (
    <>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            mb: 3, 
            borderRadius: '16px',
            background: dateFilterBg,
            boxShadow: '0 6px 16px rgba(253, 101, 133, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: -15, 
            right: -15, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.15)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2.5,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <DateRangeIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="700" 
                color="white" 
                sx={{ 
                  fontSize: '1.1rem', 
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Filter by Date Range
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  onClick={handleDateRangeFilter}
                  disabled={loading || !startDate || !endDate}
                  fullWidth
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#FD6585',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            mb: 3, 
            borderRadius: '16px',
            background: methodFilterBg,
            boxShadow: '0 6px 16px rgba(161, 196, 253, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            bottom: -15, 
            left: -15, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.15)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2.5,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <PaymentIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="700" 
                color="white" 
                sx={{ 
                  fontSize: '1.1rem', 
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Filter by Payment Method
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={10}>
                <FormControl 
                  fullWidth 
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                      },
                      '& .MuiSelect-select': {
                        paddingRight: '32px',
                        width: '100%',
                        minWidth: '180px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      width: 'auto',
                      fontSize: '0.95rem'
                    },
                    '& .MuiPaper-root': {
                      width: 280
                    }
                  }}
                >
                  <InputLabel sx={{ fontWeight: '500' }}>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 280,
                          maxHeight: 300
                        }
                      }
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        paddingRight: '32px',
                        width: '100%'
                      }
                    }}
                  >
                    <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                    <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="PAYPAL">PayPal</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  onClick={handlePaymentMethodFilter}
                  disabled={loading || !paymentMethod}
                  fullWidth
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#A1C4FD',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            mb: 3, 
            borderRadius: '16px',
            background: statusFilterBg,
            boxShadow: '0 6px 16px rgba(150, 230, 161, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: -15, 
            left: 40, 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.15)',
            zIndex: 0
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2.5,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <ReceiptIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="700" 
                color="white" 
                sx={{ 
                  fontSize: '1.1rem', 
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Filter by Payment Status
              </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={10}>
                <FormControl 
                  fullWidth 
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                      },
                      '& .MuiSelect-select': {
                        paddingRight: '32px',
                        width: '100%',
                        minWidth: '180px'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      width: 'auto',
                      fontSize: '0.95rem'
                    },
                    '& .MuiPaper-root': {
                      width: 280
                    }
                  }}
                >
                  <InputLabel sx={{ fontWeight: '500' }}>Payment Status</InputLabel>
                  <Select
                    value={paymentStatus}
                    label="Payment Status"
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 280,
                          maxHeight: 300
                        }
                      }
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        paddingRight: '32px',
                        width: '100%'
                      }
                    }}
                  >
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="contained" 
                  onClick={handlePaymentStatusFilter}
                  disabled={loading || !paymentStatus}
                  fullWidth
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#96E6A1',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            startIcon={<RestartAltIcon />}
            onClick={handleResetFilters}
            disabled={loading}
            sx={{ 
              minWidth: 180,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.2,
              background: 'linear-gradient(45deg, #FF6B6B 0%, #FFE66D 100%)',
              boxShadow: '0 6px 16px rgba(255, 107, 107, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5B5B 0%, #FFD65D 100%)',
              }
            }}
          >
            Reset All Filters
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={32} sx={{ color: '#FF6B6B' }} />
          </Box>
        )}
      </Box>
    </>
  );
};

export default BillFilter;