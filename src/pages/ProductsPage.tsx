import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import Dashboard from '../components/layout/Dashboard';
import ProductForm from '../components/products/ProductForm';
import ProductSearch from '../components/products/ProductSearch';
import ProductList from '../components/products/ProductList';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ProductService, Product } from '../services/ProductService';
import { useAuth } from '../context/AuthContext';

// Define the animation CSS
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

interface Notification {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'info'
  });
  const { authState } = useAuth();
  const theme = useTheme();
  
  // Add the animation styles to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = fadeInAnimation;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle product creation success
  const handleProductCreated = (product: Product) => {
    // Increment the refresh trigger to cause the ProductList to refresh
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
    setProductToEdit(null);
  };
  
  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setActiveTab(1); // Switch to the edit tab
  };
  
  // Handle product delete confirmation
  const handleDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Handle product delete
  const handleDeleteProduct = async () => {
    if (!productToDelete || !productToDelete.id) return;
    
    setLoading(true);
    try {
       await ProductService.deleteProduct(productToDelete.id);
        setNotification({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success'
        });
        
        // Increment the refresh trigger to cause the ProductList to refresh
        setRefreshTrigger(prev => prev + 1);
        
    } catch (err) {
      console.error('Error deleting product:', err);
      // Show error notification
      setNotification({
        open: true,
        message: 'An error occurred while deleting the product',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setShowForm(false);
    }
  };

  return (
    <Dashboard>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
                      Products Management
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Create and manage your product catalog
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setProductToEdit(null); // Reset any product being edited
                        setShowForm(true);
                        setActiveTab(1);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Add New Product
                    </Button>
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
                    <Box
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <InventoryIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Divider sx={{ mb: 3 }} />
          
          <Card 
            elevation={3} 
            sx={{ 
              width: '100%', 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              mb: 3
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
                value={activeTab} 
                onChange={handleTabChange}
                aria-label="product management tabs"
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
                  icon={<InventoryIcon />} 
                  iconPosition="start" 
                  label="Product List" 
                />
                <Tab 
                  icon={<AddIcon />} 
                  iconPosition="start" 
                  label="Add/Edit Product" 
                />
                <Tab 
                  icon={<SearchIcon />} 
                  iconPosition="start" 
                  label="Search Products" 
                />
              </Tabs>
            </Box>
          
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Product List Tab */}
            {activeTab === 0 && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <ProductList 
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteConfirm}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
            
            {/* Add/Edit Product Tab */}
            {activeTab === 1 && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <ProductForm 
                  onSuccess={handleProductCreated} 
                  initialData={productToEdit || undefined}
                  isEdit={!!productToEdit}
                />
              </div>
            )}
            
            {/* Search Products Tab */}
            {activeTab === 2 && (
              <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <ProductSearch />
              </div>
            )}
          </Box>
          </Card>
          
          {/* Confirmation Dialog for Delete */}
          <ConfirmDialog
            open={deleteDialogOpen}
            title="Delete Product"
            message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteProduct}
            onCancel={() => setDeleteDialogOpen(false)}
            severity="error"
          />
          
          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleNotificationClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleNotificationClose} 
              severity={notification.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
    </Container>
    </Dashboard>
  );
};

export default ProductsPage;