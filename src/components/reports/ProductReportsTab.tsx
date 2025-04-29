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
import InventoryIcon from '@mui/icons-material/Inventory';
import ReportService, { ProductReport, ReportFilter } from '../../services/ReportService';
import { Product } from '../../types/api.types';
import { productApi } from '../../Api/productApi';

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
      id={`product-report-tabpanel-${index}`}
      aria-labelledby={`product-report-tab-${index}`}
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
    id: `product-report-tab-${index}`,
    'aria-controls': `product-report-tabpanel-${index}`,
  };
}

const ProductReportsTab: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProductsReport, setAllProductsReport] = useState<ProductReport[] | null>(null);
  const [singleProductReport, setSingleProductReport] = useState<ProductReport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGenerateAllProductsReport = async () => {
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

      const response = await ReportService.getAllProductsReport(filter);
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to generate report');
        console.error('API error response:', response);
      } else if (!response.data) {
        setError('No data received from server');
        console.error('Empty data in response:', response);
      } else {
        setAllProductsReport(response.data);
      }
    } catch (err) {
      console.error('Error generating all products report:', err);
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingleProductReport = async () => {
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ReportService.getProductReport(selectedProductId);
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to generate report');
      } else {
        setSingleProductReport(response.data);
      }
    } catch (err) {
      console.error('Error generating product report:', err);
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProducts = async () => {
    if (!productSearchQuery.trim()) {
      return;
    }

    try {
      setProductSearchLoading(true);
      const data = await productApi.searchProducts(productSearchQuery);
      setProducts(data);
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const handleProductSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedProductId(Number(event.target.value));
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Product Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Generate reports for all products or individual product performance
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
            aria-label="product report tabs"
            sx={{ px: 2 }}
          >
            <Tab label="All Products Report" {...a11yProps(0)} />
            {/* <Tab label="Individual Product Report" {...a11yProps(1)} /> */}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Generate Report for All Products
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
                    onClick={handleGenerateAllProductsReport}
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
              Generate Report for Individual Product
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Search Product"
                    variant="outlined"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            onClick={handleSearchProducts}
                            disabled={productSearchLoading}
                          >
                            {productSearchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
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
                    label="Select Product"
                    value={selectedProductId || ''}
                    onChange={handleProductSelect}
                    variant="outlined"
                    disabled={products.length === 0}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateSingleProductReport}
                    disabled={loading || !selectedProductId}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Product Report'}
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

      {/* All Products Report */}
      {tabValue === 0 && allProductsReport && (
        <Box sx={{ mt: 4, mb: 4 }} className="report-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              All Products Report
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Sold</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Average Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(allProductsReport) && allProductsReport.map((product) => (
                  <TableRow key={product.productId} hover>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell align="right">{product.totalSold || product.totalQuantitySold || 0}</TableCell>
                    <TableCell align="right">{formatCurrency(product.totalRevenue || 0)}</TableCell>
                    <TableCell align="right">
                      {product.averagePrice ? formatCurrency(product.averagePrice) : 
                       (product.totalRevenue && product.totalSold) ? 
                       formatCurrency(product.totalRevenue / product.totalSold) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!Array.isArray(allProductsReport) || allProductsReport.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No product data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Single Product Report */}
      {tabValue === 1 && singleProductReport && (
        <Box sx={{ mt: 4, mb: 4 }} className="report-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Product Report: {singleProductReport.productName}
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

          {/* Product Summary */}
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
                    <InventoryIcon color="primary" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Product Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Product ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleProductReport.productId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Product Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {singleProductReport.productName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Price
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(singleProductReport.averagePrice)}
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
                    Sales Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Sold
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {singleProductReport.totalSold || singleProductReport.totalQuantitySold || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      {formatCurrency(singleProductReport.totalRevenue || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>

          {/* Monthly Sales Trend */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Monthly Sales Trend
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Items Sold</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Sales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {singleProductReport.monthlySalesTrend && Object.entries(singleProductReport.monthlySalesTrend).map(([month, data], index) => (
                  <TableRow key={index} hover>
                    <TableCell>{month}</TableCell>
                    <TableCell align="right">{data.itemsSold}</TableCell>
                    <TableCell align="right">{formatCurrency(data.totalSales)}</TableCell>
                  </TableRow>
                ))}
                {(!singleProductReport.monthlySalesTrend || Object.keys(singleProductReport.monthlySalesTrend || {}).length === 0) && 
                 (!singleProductReport.salesByPeriod || singleProductReport.salesByPeriod.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No monthly sales data available</TableCell>
                  </TableRow>
                )}
                {/* Fallback to old structure if available */}
                {(!singleProductReport.monthlySalesTrend || Object.keys(singleProductReport.monthlySalesTrend || {}).length === 0) && 
                 singleProductReport.salesByPeriod && singleProductReport.salesByPeriod.length > 0 && 
                 singleProductReport.salesByPeriod.map((period, index) => (
                  <TableRow key={`period-${index}`} hover>
                    <TableCell>{period.period}</TableCell>
                    <TableCell align="right">{period.sales}</TableCell>
                    <TableCell align="right">N/A</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Customer Preferences */}
          {singleProductReport.customerPreferences && singleProductReport.customerPreferences.length > 0 && (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                Customer Preferences
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unique Customers</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Repeat Purchase Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {singleProductReport.customerPreferences.map((pref, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{pref.productName}</TableCell>
                        <TableCell align="right">{pref.uniqueCustomers}</TableCell>
                        <TableCell align="right">{(pref.repeatPurchaseRate * 100).toFixed(1)}%</TableCell>
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

export default ProductReportsTab;