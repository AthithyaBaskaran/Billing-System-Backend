import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import Dashboard from '../components/layout/Dashboard';
import CustomerBillsTab from '../components/customers/CustomerBillsTab';
import { customerApi } from '../Api/customerApi';
import { Customer } from '../types/api.types';

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
      id={`customer-detail-tabpanel-${index}`}
      aria-labelledby={`customer-detail-tab-${index}`}
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
    id: `customer-detail-tab-${index}`,
    'aria-controls': `customer-detail-tabpanel-${index}`,
  };
}

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await customerApi.getCustomerById(parseInt(id));
        setCustomer(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/customers');
  };

  // Function to get initials from name
  const getInitials = (customer: Customer) => {
    if (customer.firstName) {
      return `${customer.firstName.charAt(0)}${customer.lastName ? customer.lastName.charAt(0) : ''}`;
    } else if (customer.name) {
      return customer.name.charAt(0);
    }
    return 'C';
  };

  if (loading) {
    return (
      <Dashboard>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        </Container>
      </Dashboard>
    );
  }

  if (error || !customer) {
    return (
      <Dashboard>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              borderRadius: 2, 
              py: 2,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              {error || 'Customer not found'}
            </Typography>
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Customers
          </Button>
        </Container>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to Customers
        </Button>

        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                  }}
                >
                  {getInitials(customer)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" fontWeight="bold">
                  {customer.firstName ? `${customer.firstName} ${customer.lastName}` : customer.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    icon={<PersonIcon />} 
                    label={`ID: ${customer.id}`} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    icon={<LoyaltyIcon />} 
                    label={`${customer.loyaltyPoints || 0} Points`} 
                    color="primary" 
                    size="small" 
                    variant={(customer.loyaltyPoints || 0) > 50 ? "filled" : "outlined"}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="action" />
                    <Typography variant="body1">{customer.email || 'No email provided'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1">{customer.phone || 'No phone provided'}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: 2 }}>
                  <LocationOnIcon color="action" />
                  <Typography variant="body1">{customer.address || 'No address provided'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="customer detail tabs"
              sx={{ px: 2 }}
            >
              <Tab label="Bills" {...a11yProps(0)} />
              {/* <Tab label="Orders" {...a11yProps(1)} />
              <Tab label="Activity" {...a11yProps(2)} /> */}
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              {/* {tabValue === 0 && (
                <Alert 
                  severity="info" 
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  <Typography variant="body1">
                    You can generate an invoice for this customer by clicking the <strong>Generate Invoice</strong> button at the top of the bills list.
                  </Typography>
                </Alert>
              )} */}
              <CustomerBillsTab customer={customer} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="body1">Order history will be displayed here.</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Typography variant="body1">Customer activity will be displayed here.</Typography>
            </TabPanel>
          </Box>
        </Card>
      </Container>
    </Dashboard>
  );
};

export default CustomerDetailPage;