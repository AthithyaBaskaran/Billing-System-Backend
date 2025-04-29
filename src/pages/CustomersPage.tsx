import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  useTheme, 
  alpha, 
  Divider,
  Grid,
  Stack,
  Chip,
  Avatar,
  Badge
} from '@mui/material';
import Dashboard from '../components/layout/Dashboard';
import CustomerList from '../components/customers/CustomerList';
import CustomerSearch from '../components/customers/CustomerSearch';
import CustomerNameSearch from '../components/customers/CustomerNameSearch';
import CustomerLoyaltyPoints from '../components/customers/CustomerLoyaltyPoints';
import CustomerManagement from '../components/customers/CustomerManagement';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
      style={{ 
        animation: value === index ? 'fadeIn 0.5s ease-in-out' : 'none',
      }}
    >
      {value === index && (
        <Box 
          sx={{ 
            pt: 3,
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

// Define the animation CSS
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function a11yProps(index: number) {
  return {
    id: `customer-tab-${index}`,
    'aria-controls': `customer-tabpanel-${index}`,
  };
}

const CustomersPage: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  // Add the animation styles to the document head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = fadeInAnimation;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Customer stats for the dashboard cards
  const customerStats = [
    { title: "Total Customers", count: 256, icon: <PeopleAltIcon fontSize="large" />, color: theme.palette.primary.main },
    { title: "New This Month", count: 24, icon: <Badge badgeContent="+" color="success"><PeopleAltIcon fontSize="large" /></Badge>, color: theme.palette.success.main },
    { title: "Premium Customers", count: 42, icon: <LoyaltyIcon fontSize="large" />, color: theme.palette.secondary.main },
    { title: "Inactive Customers", count: 18, icon: <PeopleAltIcon fontSize="large" />, color: theme.palette.warning.main }
  ];

  return (
    <Dashboard>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header Section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ py: 4, px: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight="bold" 
                    color="primary.main"
                    sx={{ 
                      mb: 1,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Customer Hub
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Manage your customer relationships in one place
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip 
                      label="Customer Management" 
                      color="primary" 
                      size="small" 
                      sx={{ fontWeight: 'medium' }}
                    />
                    <Chip 
                      label="Data Analytics" 
                      color="secondary" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'medium' }}
                    />
                    <Chip 
                      label="Loyalty Program" 
                      color="success" 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    p: 2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <PeopleAltIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {customerStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(stat.color, 0.2)}`
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {stat.count}
                      </Typography>
                    </Box>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Tabs Section */}
        <Card 
          elevation={3} 
          sx={{ 
            width: '100%', 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              px: 2
            }}
          >
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="customer management tabs"
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontWeight: 'medium',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                },
                '& .Mui-selected': {
                  fontWeight: 'bold',
                }
              }}
            >
              <Tab 
                icon={<ManageAccountsIcon />} 
                iconPosition="start" 
                label="Manage Customers" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<PeopleAltIcon />} 
                iconPosition="start" 
                label="All Customers" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<SearchIcon />} 
                iconPosition="start" 
                label="Search by ID/Email/Phone" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={<PersonSearchIcon />} 
                iconPosition="start" 
                label="Search by Name" 
                {...a11yProps(3)} 
              />
              <Tab 
                icon={<LoyaltyIcon />} 
                iconPosition="start" 
                label="Loyalty Points" 
                {...a11yProps(4)} 
              />
            </Tabs>
          </Box>
          
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <TabPanel value={value} index={0}>
              <CustomerManagement />
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <CustomerList />
            </TabPanel>
            
            <TabPanel value={value} index={2}>
              <CustomerSearch />
            </TabPanel>
            
            <TabPanel value={value} index={3}>
              <CustomerNameSearch />
            </TabPanel>
            
            <TabPanel value={value} index={4}>
              <CustomerLoyaltyPoints />
            </TabPanel>
          </Box>
        </Card>
      </Box>
    </Dashboard>
  );
};

export default CustomersPage;