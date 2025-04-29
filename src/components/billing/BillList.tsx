import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
  useTheme,alpha
} from '@mui/material';


import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { BillingService, Bill } from '../../services/BillingService';

interface BillListProps {
  onView?: (bill: Bill) => void;
  refreshTrigger?: number;
  customerId?: number; // Optional: to filter bills by customer
  bills?: Bill[]; // Optional: pre-filtered bills to display
}

const BillList: React.FC<BillListProps> = ({ 
  onView, 
  refreshTrigger = 0,
  customerId,
  bills: providedBills
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingBillId, setDownloadingBillId] = useState<number | null>(null);

  const fetchBills = async () => {
    // If bills are provided externally, use those instead of fetching
    if (providedBills) {
      setBills(providedBills);
      setFilteredBills(providedBills);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let data: Bill[];
      
      if (customerId) {
        data = await BillingService.getBillsByCustomer(customerId);
      } else {
        data = await BillingService.getAllBills();
      }
      
      setBills(data);
      setFilteredBills(data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [refreshTrigger, customerId, providedBills]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBills(bills);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = bills.filter(
        bill => 
          (bill.billNumber?.toLowerCase() || '').includes(term) ||
          (bill.customer?.name?.toLowerCase() || '').includes(term) ||
          (bill.paymentStatus?.toLowerCase() || '').includes(term) ||
          (bill.id?.toString() || '').includes(term)
      );
      setFilteredBills(filtered);
    }
  }, [searchTerm, bills]);

  const handleRefresh = () => {
    fetchBills();
  };

  const handleViewClick = (bill: Bill) => {
    console.log('BillList - handleViewClick called with bill:', bill);
    if (onView) {
      console.log('BillList - calling onView prop');
      onView(bill);
    } else {
      console.log('BillList - onView prop is not provided');
    }
  };
  
  const handleDownloadPdf = async (bill: Bill) => {
    if (!bill.id) return;
    
    try {
      setDownloadingBillId(bill.id);
      await BillingService.downloadBillAsPdf(bill.id);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingBillId(null);
    }
  };

  // Edit functionality removed as per requirement

  // Delete functionality removed as per requirement

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

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format as "MMM dd, yyyy"
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const theme = useTheme();
  
  // Define custom colors for a cute and professional look
  const statusColors = {
    PAID: {
      bg: '#E8F5E9',
      color: '#2E7D32',
      gradient: 'linear-gradient(135deg, #C9F7D2 0%, #A1F0B0 100%)'
    },
    PENDING: {
      bg: '#FFF8E1',
      color: '#F57C00',
      gradient: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)'
    },
    OVERDUE: {
      bg: '#FFEBEE',
      color: '#C62828',
      gradient: 'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 100%)'
    },
    CANCELLED: {
      bg: '#ECEFF1',
      color: '#546E7A',
      gradient: 'linear-gradient(135deg, #CFD8DC 0%, #B0BEC5 100%)'
    }
  };
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: '16px',
        height: '100%',
        background: 'white',
        boxShadow: 'none'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          px: 2,
          pt: 2
        }}>
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#6a82fb' }}>
              {customerId ? 'Customer Bills' : 'All Bills'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'} found
            </Typography>
          </Box>
          
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            variant="contained"
            size="small"
            sx={{ 
              borderRadius: '12px',
              textTransform: 'none',
              background: 'linear-gradient(45deg, #6a82fb 0%, #8c9eff 100%)',
              boxShadow: '0 4px 12px rgba(106, 130, 251, 0.2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a72eb 0%, #7c8eef 100%)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ px: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search bills by number, customer name, or status..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#f8f9ff',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6a82fb',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6a82fb' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {error && (
          <Box sx={{ px: 2, mb: 3 }}>
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
              }}
            >
              {error}
            </Alert>
          </Box>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <CircularProgress sx={{ color: '#6a82fb' }} />
          </Box>
        ) : filteredBills.length === 0 ? (
          <Box sx={{ px: 2 }}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
              }}
            >
              No bills found. {searchTerm ? 'Try a different search term.' : ''}
            </Alert>
          </Box>
        ) : (
          <TableContainer 
            sx={{ 
              borderRadius: '0 0 16px 16px', 
              overflow: 'hidden',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                }}>
                  <TableCell width="50" align="center" sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Bill Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Bill Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill, index) => (
                  <TableRow 
                    key={bill.id} 
                    hover
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        backgroundColor: '#f8f9ff',
                      },
                      '&:hover': { 
                        backgroundColor: alpha('#6a82fb', 0.05),
                        cursor: 'pointer'
                      },
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleViewClick(bill)}
                  >
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        backgroundColor: alpha('#6a82fb', 0.1), 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 600,
                        color: '#6a82fb'
                      }}>
                        {index + 1}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#6a82fb' }}>
                        {bill.billNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight="600">
                        {bill.customer?.firstName || ''} {bill.customer?.lastName || 'Unknown Customer'}
                      </Typography>
                      {bill.customer?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {bill.customer.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={formatDate(bill.billDate)}
                        size="small"
                        sx={{ 
                          borderRadius: '12px',
                          backgroundColor: alpha('#6a82fb', 0.1),
                          color: '#6a82fb',
                          fontWeight: 500,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="600"
                        sx={{ 
                          color: '#6a82fb',
                          background: alpha('#6a82fb', 0.1),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}
                      >
                        ${(bill.totalAmount || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={(bill.paymentStatus?.toLowerCase().replace('_', ' ')) || 'unknown'} 
                        size="small"
                        sx={{ 
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          background: statusColors[bill.paymentStatus]?.gradient || '#f5f5f5',
                          color: statusColors[bill.paymentStatus]?.color || 'text.primary',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          // Prevent row click from triggering when clicking on buttons
                          '& > *': {
                            zIndex: 2,
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClick(bill);
                            }}
                            sx={{ 
                              backgroundColor: alpha('#6a82fb', 0.1),
                              color: '#6a82fb',
                              mr: 1,
                              '&:hover': {
                                backgroundColor: alpha('#6a82fb', 0.2),
                              }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPdf(bill);
                            }}
                            disabled={downloadingBillId === bill.id}
                            sx={{ 
                              backgroundColor: alpha('#FF6B6B', 0.1),
                              color: '#FF6B6B',
                              '&:hover': {
                                backgroundColor: alpha('#FF6B6B', 0.2),
                              }
                            }}
                          >
                            {downloadingBillId === bill.id ? 
                              <CircularProgress size={20} sx={{ color: '#FF6B6B' }} /> : 
                              <DownloadIcon fontSize="small" />
                            }
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BillList;