import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import Dashboard from '../components/layout/Dashboard';
import CustomerList from '../components/customers/CustomerList';

const DashboardPage: React.FC = () => {
  return (
    <Dashboard>
      <Box sx={{ flexGrow: 1 }}>
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
              }
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Customers
            </Typography>
            <Typography component="p" variant="h4">
              24
            </Typography>
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
              }
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Invoices
            </Typography>
            <Typography component="p" variant="h4">
              12
            </Typography>
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
              }
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Pending Payments
            </Typography>
            <Typography component="p" variant="h4">
              5
            </Typography>
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
              }
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Overdue Invoices
            </Typography>
            <Typography component="p" variant="h4">
              2
            </Typography>
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
