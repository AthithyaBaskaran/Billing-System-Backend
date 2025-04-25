import React from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import Dashboard from '../components/layout/Dashboard';
import CustomerList from '../components/customers/CustomerList';
import CustomerSearch from '../components/customers/CustomerSearch';
import CustomerNameSearch from '../components/customers/CustomerNameSearch';
import CustomerLoyaltyPoints from '../components/customers/CustomerLoyaltyPoints';
import CustomerManagement from '../components/customers/CustomerManagement';

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
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
    id: `customer-tab-${index}`,
    'aria-controls': `customer-tabpanel-${index}`,
  };
}

const CustomersPage: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Dashboard>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Management
        </Typography>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="customer management tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Manage Customers" {...a11yProps(0)} />
              <Tab label="All Customers" {...a11yProps(1)} />
              <Tab label="Search by ID/Email/Phone" {...a11yProps(2)} />
              <Tab label="Search by Name" {...a11yProps(3)} />
              <Tab label="Loyalty Points" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
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
        </Paper>
      </Box>
    </Dashboard>
  );
};

export default CustomersPage;