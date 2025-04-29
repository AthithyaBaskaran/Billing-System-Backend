import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { BillingService, Bill } from '../../services/BillingService';

interface BillDetailProps {
  billId?: number;
  billNumber?: string;
  bill?: Bill;
  onBack?: () => void;
}

const BillDetail: React.FC<BillDetailProps> = ({ 
  billId, 
  billNumber, 
  bill: initialBill, 
  onBack 
}) => {
  console.log('BillDetail - component called with props:', { billId, billNumber, initialBill });
  const [bill, setBill] = useState<Bill | null>(initialBill || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    console.log('BillDetail - useEffect called with initialBill:', initialBill);
    if (initialBill) {
      console.log('BillDetail - setting bill from initialBill');
      setBill(initialBill);
      return;
    }

    const fetchBill = async () => {
      if (!billId && !billNumber) {
        setError('No bill ID or number provided');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        let data: Bill;
        
        if (billId) {
          data = await BillingService.getBillById(billId);
        } else if (billNumber) {
          data = await BillingService.getBillByNumber(billNumber);
        } else {
          throw new Error('No bill identifier provided');
        }
        
        setBill(data);
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError('Failed to load bill details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId, billNumber, initialBill]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format as "Month DD, YYYY"
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!bill || !bill.id) {
      setNotification({
        open: true,
        message: 'Cannot download PDF: Bill ID is missing',
        severity: 'error'
      });
      return;
    }
    
    try {
      await BillingService.downloadBillAsPdf(bill.id);
      setNotification({
        open: true,
        message: 'PDF download started',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setNotification({
        open: true,
        message: 'Failed to download PDF. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handlePaymentStatusChange = async (event: SelectChangeEvent<string>) => {
    if (!bill || !bill.id) return;
    
    const newStatus = event.target.value;
    setUpdatingStatus(true);
    
    try {
      const updatedBill = await BillingService.updateBillPaymentStatus(bill.id, newStatus);
      setBill(updatedBill);
      setNotification({
        open: true,
        message: `Payment status updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating payment status:', err);
      setNotification({
        open: true,
        message: 'Failed to update payment status',
        severity: 'error'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!bill) {
    return (
      <Alert severity="info">
        No bill information available.
      </Alert>
    );
  }
  
  const theme = useTheme();

  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid rgba(106, 130, 251, 0.1)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back
          </Button>
          
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Print
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              variant="contained"
              size="small"
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                backgroundColor: 'white',
                color: '#6a82fb',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Download PDF
            </Button>
          </Stack>
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #f0f7ff 0%, #ffffff 100%)',
            border: '1px solid rgba(106, 130, 251, 0.1)',
            boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Invoice #{bill.billNumber}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 2 }}>
                <Chip 
                  label={bill.paymentStatus.toLowerCase().replace('_', ' ')} 
                  color={getStatusChipColor(bill.paymentStatus) as any}
                  sx={{ 
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    px: 1.5
                  }}
                />
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px'
                    }
                  }} 
                  disabled={updatingStatus}
                >
                  <InputLabel id="payment-status-label">Update Status</InputLabel>
                  <Select
                    labelId="payment-status-label"
                    value=""
                    onChange={handlePaymentStatusChange}
                    label="Update Status"
                    size="small"
                  >
                    <MenuItem value="PAID">PAID</MenuItem>
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                    <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                  </Select>
                </FormControl>
                {updatingStatus && <CircularProgress size={24} sx={{ color: '#6a82fb' }} />}
              </Box>
            </Box>
            <Box sx={{ 
              textAlign: { xs: 'left', sm: 'right' }, 
              mt: { xs: 2, sm: 0 },
              backgroundColor: 'rgba(106, 130, 251, 0.1)',
              borderRadius: '12px',
              p: 2
            }}>
              <Typography variant="body1" fontWeight="600" sx={{ color: '#6a82fb' }}>
                Date: {formatDate(bill.billDate)}
              </Typography>
              {bill.dueDate && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Due Date: {formatDate(bill.dueDate)}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                border: '1px solid rgba(106, 130, 251, 0.1)',
                boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 4px 10px rgba(106, 130, 251, 0.3)'
                }}>
                  <Typography variant="subtitle1" fontWeight="600" color="white">F</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ 
                  background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Bill From
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                Your Company Name
              </Typography>
              <Typography variant="body2" color="text.secondary">
                123 Business Street
              </Typography>
              <Typography variant="body2" color="text.secondary">
                City, State, ZIP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Phone: (123) 456-7890
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: billing@yourcompany.com
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                border: '1px solid rgba(106, 130, 251, 0.1)',
                boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 4px 10px rgba(255, 154, 158, 0.3)'
                }}>
                  <Typography variant="subtitle1" fontWeight="600" color="white">T</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ 
                  background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Bill To
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
                {bill.customer.name}
              </Typography>
              {bill.customer.address && (
                <Typography variant="body2" color="text.secondary">
                  {bill.customer.address}
                </Typography>
              )}
              {bill.customer.phone && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Phone: {bill.customer.phone}
                </Typography>
              )}
              {bill.customer.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {bill.customer.email}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            mb: 4,
            border: '1px solid rgba(106, 130, 251, 0.1)',
            boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)'
          }}
        >
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '10px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mr: 2
            }}>
              <Typography variant="subtitle1" fontWeight="600" color="white">I</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="600">
              Invoice Items
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(106, 130, 251, 0.05)' }}>
                  <TableCell width="50" align="center" sx={{ fontWeight: 'bold', py: 2 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Discount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Tax</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow 
                    key={item.id || index} 
                    hover
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: 'rgba(106, 130, 251, 0.02)' 
                      }
                    }}
                  >
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Box sx={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(106, 130, 251, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 600,
                        color: '#6a82fb',
                        margin: '0 auto'
                      }}>
                        {index + 1}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="600">
                        {item.productName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Chip 
                        label={item.quantity}
                        size="small"
                        sx={{ 
                          borderRadius: '8px',
                          backgroundColor: 'rgba(106, 130, 251, 0.1)',
                          color: '#6a82fb',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>${(item.unitPrice || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>${(item.discount || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>${(item.tax || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Typography 
                        fontWeight="600"
                        sx={{ 
                          color: '#6a82fb',
                          background: 'rgba(106, 130, 251, 0.1)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '8px',
                          display: 'inline-block'
                        }}
                      >
                        ${(item.total || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: '16px',
              maxWidth: 350,
              width: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              border: '1px solid rgba(106, 130, 251, 0.1)',
              boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 10px rgba(67, 203, 255, 0.3)'
              }}>
                <Typography variant="subtitle1" fontWeight="600" color="white">S</Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ 
                background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Summary
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right" fontWeight="600">${(bill.subtotal || 0).toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Discount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right" fontWeight="600" color="error.main">-${(bill.discountAmount || 0).toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Tax:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right" fontWeight="600">${(bill.taxAmount || 0).toFixed(2)}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="600">Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  align="right" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ${(bill.totalAmount || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {bill.notes && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              border: '1px solid rgba(106, 130, 251, 0.1)',
              boxShadow: '0 8px 20px rgba(106, 130, 251, 0.1)',
              mb: 4
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 10px rgba(212, 252, 121, 0.3)'
              }}>
                <Typography variant="subtitle1" fontWeight="600" color="white">N</Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ 
                background: 'linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Notes
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {bill.notes}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ 
          mt: 4, 
          textAlign: 'center', 
          p: 3, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
          color: 'white',
          boxShadow: '0 8px 20px rgba(106, 130, 251, 0.2)'
        }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Thank you for your business!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            We appreciate your prompt payment and look forward to serving you again.
          </Typography>
        </Box>
      </CardContent>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '12px'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default BillDetail;