import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import Dashboard from '../components/layout/Dashboard';
import BusinessReportTab from '../components/reports/BusinessReportTab';
import CustomerReportsTab from '../components/reports/CustomerReportsTab';
import ProductReportsTab from '../components/reports/ProductReportsTab';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const ReportsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dashboard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              <Grid item>
                <BarChartIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Grid>
              <Grid item xs>
                <Typography 
                  variant="h4" 
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
                  Reports & Analytics
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Generate and view detailed reports for your business
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="report tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                px: 2,
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
                icon={<BusinessIcon />} 
                iconPosition="start" 
                label="Business Overview" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<PeopleIcon />} 
                iconPosition="start" 
                label="Customer Reports" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<InventoryIcon />} 
                iconPosition="start" 
                label="Product Reports" 
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <BusinessReportTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <CustomerReportsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ProductReportsTab />
            </TabPanel>
          </Box>
        </Card>
      </Container>
    </Dashboard>
  );
};

export default ReportsPage;