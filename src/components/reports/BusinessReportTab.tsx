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
  TextField,
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
  Chip,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReportService, { BusinessReport, ReportFilter } from '../../services/ReportService';

const BusinessReportTab: React.FC = () => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BusinessReport | null>(null);

  const handleGenerateReport = async () => {
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

      const response = await ReportService.getBusinessReport(filter);
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to generate report');
        console.error('API error response:', response);
      } else if (!response.data) {
        setError('No data received from server');
        console.error('Empty data in response:', response);
      } else {
        setReport(response.data);
      }
    } catch (err) {
      console.error('Error generating business report:', err);
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
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
          Business Overview Report
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Generate a comprehensive report of your business performance
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
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Report Parameters
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
                  onClick={handleGenerateReport}
                  disabled={loading}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                </Button>
              </Grid>
            </Grid>
          </Box>
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

      {report && (
        <Box sx={{ mt: 4, mb: 4 }} className="report-content">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Business Performance Report
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

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(report?.totalRevenue || 0)}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.primary.main, 0.1) 
                      }}
                    >
                      <AttachMoneyIcon color="primary" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.secondary.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Total Bills
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {report?.totalBills || report?.totalSales || 0}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1) 
                      }}
                    >
                      <ShoppingCartIcon color="secondary" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.success.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Avg. Bill Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(report?.averageBillValue || report?.averageOrderValue || 0)}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.success.main, 0.1) 
                      }}
                    >
                      <ReceiptIcon color="success" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.info.main, 0.2)}`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Customer Count
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                        {report?.customerCount || 0}
                        {report?.newCustomersThisMonth && report.newCustomersThisMonth > 0 && (
                          <Chip 
                            size="small" 
                            color="success" 
                            label={`+${report.newCustomersThisMonth} new`} 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.info.main, 0.1) 
                      }}
                    >
                      <TrendingUpIcon color="info" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Performing Categories */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Top Performing Categories
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Growth</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.topPerformingCategories && report.topPerformingCategories.map((category, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{category.category}</TableCell>
                    <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {category.growth > 0 ? (
                          <>
                            <TrendingUpIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                            <Typography color="success.main">{category.growth}%</Typography>
                          </>
                        ) : category.growth < 0 ? (
                          <>
                            <TrendingDownIcon color="error" sx={{ mr: 0.5 }} fontSize="small" />
                            <Typography color="error.main">{Math.abs(category.growth)}%</Typography>
                          </>
                        ) : (
                          '0%'
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(!report.topPerformingCategories || report.topPerformingCategories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No category data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Payment Method Breakdown */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Payment Method Breakdown
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Count</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.paymentMethodBreakdown && Object.entries(report.paymentMethodBreakdown).map(([method, data], index) => (
                  <TableRow key={index} hover>
                    <TableCell>{method.replace('_', ' ')}</TableCell>
                    <TableCell align="right">{data.count}</TableCell>
                    <TableCell align="right">{formatCurrency(data.amount)}</TableCell>
                  </TableRow>
                ))}
                {(!report.paymentMethodBreakdown || Object.keys(report.paymentMethodBreakdown || {}).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No payment method data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Sales by Day of Week */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
            Sales by Day of Week
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.salesByDayOfWeek && Object.entries(report.salesByDayOfWeek).map(([day, amount], index) => (
                  <TableRow key={index} hover>
                    <TableCell>{day.charAt(0) + day.slice(1).toLowerCase()}</TableCell>
                    <TableCell align="right">{formatCurrency(amount)}</TableCell>
                  </TableRow>
                ))}
                {(!report.salesByDayOfWeek || Object.keys(report.salesByDayOfWeek || {}).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No day of week data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default BusinessReportTab;