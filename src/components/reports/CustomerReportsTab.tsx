import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ReportService, { CustomerReport, ReportFilter } from '../../services/ReportService';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-report-tabpanel-${index}`}
      aria-labelledby={`customer-report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `customer-report-tab-${index}`,
    'aria-controls': `customer-report-tabpanel-${index}`,
  };
}

const CustomerReportsTab: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCustomersReport, setAllCustomersReport] = useState<CustomerReport[] | null>(null);
  const [singleCustomerReport, setSingleCustomerReport] = useState<CustomerReport | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGenerateAllCustomersReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: ReportFilter = {};
      if (startDate) {
        filter.startDate = startDate;
      }
      if (endDate) {
        filter.endDate = endDate;
      }

      const response = await ReportService.getAllCustomersReport(filter);
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to generate report');
        console.error('API error response:', response);
      } else if (!response.data) {
        setError('No data received from server');
        console.error('Empty data in response:', response);
      } else {
        setAllCustomersReport(response.data);
      }
    } catch (err) {
      console.error('Error generating all customers report:', err);
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingleCustomerReport = async () => {
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ReportService.getCustomerReport(selectedCustomerId);
      console.log('Customer report response:', response);
      
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to generate report');
      } else if (!response.data) {
        setError('No data received from server');
        console.error('Empty data in response:', response);
      } else {
        console.log('Setting single customer report data:', response.data);
        
        // Make sure we have a valid customer report object
        const customerData = response.data;
        if (!customerData.customerId || !customerData.customerName) {
          console.error('Invalid customer data format:', customerData);
          setError('Invalid customer data format received from server');
          return;
        }
        
        // Ensure all required fields have default values if missing
        const processedData: CustomerReport = {
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          totalSpending: customerData.totalSpending || customerData.totalSpent || 0,
          purchaseCount: customerData.purchaseCount || customerData.totalOrders || 0,
          averageBillAmount: customerData.averageBillAmount || customerData.averageOrderValue || 0,
          mostPurchasedProducts: customerData.mostPurchasedProducts || [],
          monthlySpending: customerData.monthlySpending || {},
          loyaltyPoints: customerData.loyaltyPoints || 0,
          customerRank: customerData.customerRank || null,
          lastOrderDate: customerData.lastOrderDate || undefined,
          purchaseHistory: customerData.purchaseHistory || []
        };
        
        setSingleCustomerReport(processedData);
      }
    } catch (err) {
      console.error('Error generating customer report:', err);
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCustomers = async () => {
    if (!customerSearchQuery.trim()) {
      return;
    }

    try {
      setCustomerSearchLoading(true);
      const data = await customerApi.searchCustomersByFirstName(customerSearchQuery);
      setCustomers(data);
    } catch (err) {
      console.error('Error searching customers:', err);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  const handleCustomerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCustomerId(Number(event.target.value));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically connect to a backend endpoint that generates a PDF
    alert('PDF download functionality would be implemented here');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  const formatMonth = (monthString: string) => {
    try {
      const [year, monthNum] = monthString.split('-');
      if (year && monthNum) {
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      return monthString;
    } catch (error) {
      console.error('Error formatting month:', error);
      return monthString;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Customer Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Generate reports for all customers or individual customer performance
        </Typography>
      </Box>

      <Card 
        elevation={2} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="customer report tabs"
            sx={{ px: 2 }}
          >
            <Tab label="All Customers Report" {...a11yProps(0)} />
            {/* <Tab label="Individual Customer Report" {...a11yProps(1)} /> */}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Generate Report for All Customers
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateAllCustomersReport}
                    disabled={loading}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Generate Report for Individual Customer
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Search Customer"
                    variant="outlined"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            onClick={handleSearchCustomers}
                            disabled={customerSearchLoading}
                          >
                            {customerSearchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Select Customer"
                    value={selectedCustomerId || ''}
                    onChange={handleCustomerSelect}
                    variant="outlined"
                    disabled={customers.length === 0}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName 
                          ? `${customer.firstName} ${customer.lastName}` 
                          : customer.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateSingleCustomerReport}
                    disabled={loading || !selectedCustomerId}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Customer Report'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            This could be due to the backend server not running or the API endpoint not being implemented yet.
            Please check the server logs for more information.
          </Typography>
        </Alert>
      )}

      {/* All Customers Report */}
      {tabValue === 0 && allCustomersReport && (
        <Box sx={{ mt: 4, mb: 4 }} className="report-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              All Customers Report
            </Typography>
            <Box>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                variant="contained"
              >
                Download PDF
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {startDate && endDate
              ? `Report Period: ${startDate} - ${endDate}`
              : startDate
              ? `Report Period: From ${startDate}`
              : endDate
              ? `Report Period: Until ${endDate}`
              : 'All Time Report'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Purchase Count</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Spending</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Avg. Bill Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Most Purchased Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monthly Spending</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Loyalty Points</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Customer Rank</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(allCustomersReport) && allCustomersReport.map((customer) => {
                  // Get the most purchased product
                  const topProduct = customer.mostPurchasedProducts && customer.mostPurchasedProducts.length > 0 
                    ? customer.mostPurchasedProducts[0] 
                    : null;
                  
                  // Get the latest monthly spending
                  const monthlySpendingEntries = customer.monthlySpending 
                    ? Object.entries(customer.monthlySpending) 
                    : [];
                  const latestMonth = monthlySpendingEntries.length > 0 
                    ? monthlySpendingEntries.sort((a, b) => b[0].localeCompare(a[0]))[0] 
                    : null;
                  
                  return (
                    <TableRow key={customer.customerId} hover>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell align="right">{customer.purchaseCount || customer.totalOrders || 0}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.totalSpending || customer.totalSpent || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.averageBillAmount || customer.averageOrderValue || 0)}</TableCell>
                      <TableCell>
                        {topProduct ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {topProduct.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Purchased {topProduct.purchaseCount} times
                            </Typography>
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        {latestMonth ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(latestMonth[1])}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatMonth(latestMonth[0])}
                            </Typography>
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell align="right">{customer.loyaltyPoints || 0}</TableCell>
                      <TableCell align="right">{customer.customerRank || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
                {(!Array.isArray(allCustomersReport) || allCustomersReport.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No customer data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Single Customer Report */}
      {tabValue === 1 && !singleCustomerReport && !loading && !error && (
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a customer and generate a report to view customer details.
          </Typography>
        </Box>
      )}
      
      {/* Single Customer Report Details */}
      {tabValue === 1 && singleCustomerReport && (
        <Box sx={{ mt: 4, mb: 4 }} className="report-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Customer Report: {singleCustomerReport.customerName}
            </Typography>
            <Box>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                variant="contained"
              >
                Download PDF
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  p: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      mr: 2
                    }}
                  >
                    <PersonIcon color="primary" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Customer Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleCustomerReport.customerId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleCustomerReport.customerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Loyalty Points
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleCustomerReport.loyaltyPoints || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Customer Rank
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleCustomerReport.customerRank || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Order Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(singleCustomerReport.lastOrderDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  p: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      mr: 2
                    }}
                  >
                    <DownloadIcon color="secondary" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Purchase Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Purchase Count
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {singleCustomerReport.purchaseCount || singleCustomerReport.totalOrders || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Spending
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {formatCurrency(singleCustomerReport.totalSpending || singleCustomerReport.totalSpent || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Bill Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(singleCustomerReport.averageBillAmount || singleCustomerReport.averageOrderValue || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>

          {/* Most Purchased Products */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Most Purchased Products
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Purchase Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {singleCustomerReport.mostPurchasedProducts && singleCustomerReport.mostPurchasedProducts.length > 0 ? (
                  singleCustomerReport.mostPurchasedProducts.map((product, index) => (
                    <TableRow key={product.productId || `product-${index}`} hover>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="right">{product.purchaseCount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No product data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Monthly Spending */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Monthly Spending
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {singleCustomerReport.monthlySpending && 
                 typeof singleCustomerReport.monthlySpending === 'object' && 
                 Object.keys(singleCustomerReport.monthlySpending).length > 0 ? (
                  Object.entries(singleCustomerReport.monthlySpending).map(([month, amount], index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatMonth(month)}</TableCell>
                      <TableCell align="right">{formatCurrency(amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No monthly spending data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Purchase History (fallback to old structure if available) */}
          {singleCustomerReport.purchaseHistory && singleCustomerReport.purchaseHistory.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                Purchase History
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bill Number</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Items</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {singleCustomerReport.purchaseHistory.map((purchase) => (
                      <TableRow key={purchase.billId} hover>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell>{purchase.billNumber}</TableCell>
                        <TableCell align="right">{purchase.items}</TableCell>
                        <TableCell align="right">{formatCurrency(purchase.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomerReportsTab;