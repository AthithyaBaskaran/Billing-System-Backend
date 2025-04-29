import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import Dashboard from '../components/layout/Dashboard';
import CustomerList from '../components/customers/CustomerList';
import { DashboardService, DashboardCounts} from '../services/DashboardService';
const DashboardPage: React.FC = () => {
  const [counts, setCounts] = useState<DashboardCounts>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getAllCounts();
        setCounts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);

  return (
    <Dashboard>
      <Box sx={{ flexGrow: 1 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3 
        }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#bbdefb',
              flexGrow: 1,
              flexBasis: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Customers
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography component="p" variant="h4">
                {counts.totalCount || 0}
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#c8e6c9',
              flexGrow: 1,
              flexBasis: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Product
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography component="p" variant="h4">
                {counts.productCount || 0}
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ffecb3',
              flexGrow: 1,
              flexBasis: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Bill Amount
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography component="p" variant="h4">
                {counts.billCount || 0}
              </Typography>
            )}
          </Paper>

          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ffcdd2',
              flexGrow: 1,
              flexBasis: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              },
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Customer count
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography component="p" variant="h4">
                {counts.customerCount || 0}
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Customer List */}
        <Paper sx={{ p: 2 }}>
          <CustomerList />
        </Paper>
      </Box>
    </Dashboard>
  );
};

export default DashboardPage;
