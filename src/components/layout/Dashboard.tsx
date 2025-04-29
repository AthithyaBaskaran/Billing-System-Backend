import React, { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Box, 
  Button,
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon,
  ListItemText, 
  Toolbar, 
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Switch,
  styled
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

// Icons as SVG for better customization
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const CustomersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const BillingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="M12 9v6"></path>
    <path d="M8 12h8"></path>
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const LightModeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const DarkModeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Custom styled Material-UI Switch for theme toggle
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// Drawer width configuration
const drawerWidth = 260;
const collapsedDrawerWidth = 72;

interface DashboardProps {
  children: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const { authState, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Customers', path: '/customers', icon: <CustomersIcon /> },
    { text: 'Products', path: '/products', icon: <ProductsIcon /> },
    { text: 'Billing', path: '/billing', icon: <BillingIcon /> },
    { text: 'Reports', path: '/reports', icon: <ReportsIcon /> }
  ];

  const currentWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Logo and App Title */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: drawerCollapsed ? 'center' : 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}>
        {!drawerCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                width: 40,
                height: 40
              }}
            >
              BS
            </Avatar>
            <Typography variant="h6" fontWeight="700" sx={{ color: 'primary.main' }}>
              BillSystem
            </Typography>
          </Box>
        )}
        {drawerCollapsed && (
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              width: 40,
              height: 40
            }}
          >
            BS
          </Avatar>
        )}
        {!mobileOpen && (
          <IconButton 
            onClick={toggleDrawerCollapse}
            sx={{ 
              color: 'primary.main',
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      {/* User Profile Section */}
      {!drawerCollapsed && (
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              mb: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.8),
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {authState.user?.name.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="600">
            {authState.user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {authState.user?.email || 'user@example.com'}
          </Typography>
          <Chip 
            label="Admin" 
            size="small" 
            color="primary" 
            sx={{ 
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }} 
          />
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        py: 2,
      }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  selected={isActive}
                  sx={{ 
                    py: 1.2,
                    px: drawerCollapsed ? 1 : 2,
                    borderRadius: '12px',
                    mx: 1,
                    minHeight: 48,
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
                      }
                    },
                  }}
                >
                  <Tooltip title={drawerCollapsed ? item.text : ""} placement="right">
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 0, 
                        mr: drawerCollapsed ? 0 : 2,
                        justifyContent: 'center',
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {!drawerCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}>
        {/* Theme Toggle */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: drawerCollapsed ? 'center' : 'space-between',
          mb: 2
        }}>
          {!drawerCollapsed && (
            <Typography variant="body2" fontWeight={500}>
              {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
            </Typography>
          )}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            {drawerCollapsed ? (
              <IconButton onClick={toggleColorMode} size="small">
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            ) : (
              <MaterialUISwitch 
                checked={mode === 'dark'} 
                onChange={toggleColorMode} 
              />
            )}
          </Tooltip>
        </Box>

        {/* Logout Button */}
        {!drawerCollapsed ? (
          <Button 
            fullWidth 
            variant="outlined" 
            color="primary" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ 
              borderRadius: '12px',
              justifyContent: 'flex-start',
              py: 1,
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
                background: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Logout
          </Button>
        ) : (
          <Tooltip title="Logout">
            <IconButton 
              onClick={handleLogout} 
              sx={{ 
                color: 'primary.main',
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                borderRadius: '12px',
                p: 1,
                width: '100%',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.04),
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentWidth}px)` },
          ml: { sm: `${currentWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight="600">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {authState.user && (
              <Chip
                avatar={<Avatar>{authState.user.name.charAt(0)}</Avatar>}
                label={authState.user.name}
                color="primary"
                variant="outlined"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  '& .MuiChip-avatar': { 
                    bgcolor: 'white', 
                    color: 'primary.main' 
                  },
                  display: { xs: 'none', md: 'flex' }
                }}
              />
            )}
            <Button 
              color="inherit" 
              variant="outlined" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: currentWidth }, 
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRadius: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentWidth,
              borderRadius: 0,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${currentWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.primary.main, 0.02)
            : 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Dashboard;