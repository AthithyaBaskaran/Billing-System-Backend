import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  useTheme, 
  alpha, 
  Grid, 
  Fade,
  Divider,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Dashboard from '../components/layout/Dashboard';
import BillFilter from '../components/billing/BillFilter';
import BillList from '../components/billing/BillList';
import BillDetail from '../components/billing/BillDetail';
import { Bill } from '../services/BillingService';

enum ViewMode {
  LIST,
  DETAIL
}

const BillFilterPage: React.FC = () => {
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.LIST);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Handle bills loaded from filter component
  const handleBillsLoaded = (bills: Bill[]) => {
    setFilteredBills(bills);
  };

  // Handle view bill
  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setCurrentView(ViewMode.DETAIL);
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setCurrentView(ViewMode.LIST);
    setSelectedBill(null);
  };

  // Edit functionality removed as per requirement

  // Delete functionality removed as per requirement

  // Add console logs to track state changes
  useEffect(() => {
    console.log('BillFilterPage - currentView changed:', currentView);
  }, [currentView]);
  
  useEffect(() => {
    console.log('BillFilterPage - selectedBill changed:', selectedBill);
  }, [selectedBill]);

  const theme = useTheme();
  
  // Define custom colors for a cute and professional look
  const pastelBlue = alpha(theme.palette.primary.main, 0.1);
  const pastelPurple = alpha(theme.palette.secondary.main, 0.1);
  const pastelPink = '#FFF0F5';
  const pastelGreen = '#E8F5E9';
  const pastelYellow = '#FFFDE7';
  
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
            {currentView === ViewMode.DETAIL && selectedBill ? (
              <Box>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToList}
                  variant="contained"
                  sx={{ 
                    mb: 3, 
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(45deg, #6a82fb 0%, #8c9eff 100%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a72eb 0%, #7c8eef 100%)',
                    }
                  }}
                >
                  Back to Bills
                </Button>
                
                <BillDetail 
                  bill={selectedBill} 
                  onBack={handleBackToList} 
                />
              </Box>
            ) : (
              <>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 4, 
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6a82fb 0%, #8c9eff 100%)',
                    color: 'white',
                    boxShadow: '0 10px 20px rgba(106, 130, 251, 0.2)',
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
                    <Grid item xs={12} md={7}>
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
                          <FilterAltIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="600" gutterBottom>
                            Advanced Bill Filters
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Find exactly what you're looking for with our powerful filtering options
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'flex-start', md: 'flex-end' }
                      }}>
                        <Chip 
                          label="Date Range" 
                          sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                          }} 
                        />
                        <Chip 
                          label="Payment Method" 
                          sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                          }} 
                        />
                        <Chip 
                          label="Payment Status" 
                          sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                          }} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                        height: '100%',
                        background: 'white'
                      }}
                    >
                      <Box sx={{ 
                        p: 3, 
                        background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '12px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <FilterAltIcon sx={{ color: 'white' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="600" color="white">
                          Filter Options
                        </Typography>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Use the filters below to search for bills by date range, payment method, or payment status.
                        </Typography>
                        
                        {/* Bill Filter Component */}
                        <BillFilter onBillsLoaded={handleBillsLoaded} />
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                        background: 'white'
                      }}
                    >
                      <Box sx={{ 
                        p: 3, 
                        background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '12px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <ReceiptLongIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="600" color="white">
                            Filtered Bills
                          </Typography>
                          <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                            {filteredBills.length > 0 
                              ? `Showing ${filteredBills.length} filtered bills` 
                              : 'Apply filters to see results'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ p: 3 }}>
                        {/* Bill List Component */}
                        <BillList 
                          onView={handleViewBill}
                          refreshTrigger={refreshTrigger}
                          // If filteredBills is empty, BillList will load all bills by default
                          // If filteredBills has items, BillList will use those instead
                          bills={filteredBills}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </Dashboard>
  );
};

export default BillFilterPage;