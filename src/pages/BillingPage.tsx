import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Stack,
  Paper,
  Grid,
  Divider,
  Fade,
  useTheme,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';
import Dashboard from '../components/layout/Dashboard';
import BillList from '../components/billing/BillList';
import BillDetail from '../components/billing/BillDetail';
import BillForm from '../components/billing/BillForm';
import { Bill, BillingService } from '../services/BillingService';

enum BillingView {
  LIST,
  DETAIL,
  CREATE,
  EDIT
}

const BillingPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<BillingView>(BillingView.LIST);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Delete functionality removed as per requirement
  
  // Log state changes
  useEffect(() => {
    console.log('BillingPage - currentView changed:', currentView);
  }, [currentView]);
  
  useEffect(() => {
    console.log('BillingPage - selectedBill changed:', selectedBill);
  }, [selectedBill]);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleViewBill = (bill: Bill) => {
    console.log('BillingPage - handleViewBill called with bill:', bill);
    setSelectedBill(bill);
    setCurrentView(BillingView.DETAIL);
    console.log('BillingPage - currentView set to:', BillingView.DETAIL);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setCurrentView(BillingView.EDIT);
  };

  // Delete functionality removed as per requirement

  const handleCreateBill = () => {
    setSelectedBill(null);
    setCurrentView(BillingView.CREATE);
  };

  const handleSaveBill = (bill: Bill) => {
    setNotification({
      open: true,
      message: `Bill ${bill.billNumber} ${selectedBill ? 'updated' : 'created'} successfully`,
      severity: 'success'
    });
    
    // Refresh the bill list and go back to it
    setRefreshTrigger(prev => prev + 1);
    setCurrentView(BillingView.LIST);
  };

  const handleBackToList = () => {
    setCurrentView(BillingView.LIST);
    setSelectedBill(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Removed renderContent function as we're now using inline conditional rendering

  console.log('BillingPage - render called, currentView:', currentView);
  
  const theme = useTheme();
  
  return (
    <Dashboard>
      <Box sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.05)' : '#f8f9ff',
        borderRadius: '16px',
        py: 3,
        px: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Fade in={true} timeout={800}>
          <Box>
            {currentView === BillingView.DETAIL && selectedBill ? (
              <BillDetail 
                bill={selectedBill} 
                onBack={handleBackToList} 
              />
            ) : currentView === BillingView.CREATE ? (
              <>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(106, 130, 251, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 4px 12px rgba(106, 130, 251, 0.3)'
                    }}>
                      <ReceiptLongIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" sx={{ 
                      background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Create New Bill
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <BillForm 
                    onSave={handleSaveBill}
                    onCancel={handleBackToList}
                  />
                </Paper>
              </>
            ) : currentView === BillingView.EDIT && selectedBill ? (
              <>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(106, 130, 251, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: '0 4px 12px rgba(106, 130, 251, 0.3)'
                    }}>
                      <ReceiptLongIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="600" sx={{ 
                      background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Edit Bill #{selectedBill.billNumber}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <BillForm 
                    billId={selectedBill.id}
                    onSave={handleSaveBill}
                    onCancel={handleBackToList}
                  />
                </Paper>
              </>
            ) : (
              <>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(106, 130, 251, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
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
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: -30, 
                    left: -30, 
                    width: 180, 
                    height: 180, 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.1)',
                    zIndex: 0
                  }} />
                  
                  <Grid container spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 56, 
                          height: 56, 
                          borderRadius: '14px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <ReceiptLongIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="600">Billing Management</Typography>
                          <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
                            Create, view and manage all your billing operations
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<FilterListIcon />}
                          component={Link}
                          to="/bill-filters"
                          sx={{ 
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 2,
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            color: 'white',
                            '&:hover': {
                              borderColor: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          Advanced Filters
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleCreateBill}
                          sx={{ 
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 2,
                            backgroundColor: 'white',
                            color: '#6a82fb',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }
                          }}
                        >
                          Create New Bill
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        borderRadius: '16px',
                        height: '100%',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(106, 130, 251, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <Box sx={{ 
                        width: 70, 
                        height: 70, 
                        borderRadius: '18px', 
                        background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 3,
                        boxShadow: '0 8px 20px rgba(106, 130, 251, 0.3)'
                      }}>
                        <DashboardIcon sx={{ color: 'white', fontSize: 36 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom sx={{ 
                        background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Quick Stats
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        View your billing statistics and performance metrics
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="medium"
                        component={Link}
                        to="/dashboard"
                        sx={{ 
                          borderRadius: '12px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                          boxShadow: '0 4px 12px rgba(106, 130, 251, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a72eb 0%, #7c8eef 100%)',
                          }
                        }}
                      >
                        View Dashboard
                      </Button>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <BillList
                      onView={handleViewBill}
                      refreshTrigger={refreshTrigger}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Fade>
        
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
      </Box>
    </Dashboard>
  );
};

export default BillingPage;