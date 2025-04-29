import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  Snackbar,
  TablePagination,
  Card,
  CardContent,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Badge
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, Link } from 'react-router-dom';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';
import CustomerEditForm from './CustomerEditForm';

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAllCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEditClick = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    
    try {
      setLoading(true);
      await customerApi.deleteCustomer(customerToDelete.id);
      
      // Navigate to success page
      const customerName = customerToDelete.firstName 
        ? `${customerToDelete.firstName} ${customerToDelete.lastName}`
        : customerToDelete.name;
        
      navigate('/customer-success', { 
        state: { 
          operation: 'delete',
          customerName: customerName
        } 
      });
    } catch (err) {
      console.error('Error deleting customer:', err);
      setNotification({
        open: true,
        message: 'Failed to delete customer. Please try again.',
        severity: 'error'
      });
      setLoading(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedCustomerId(null);
  };

  const handleEditSuccess = async () => {
    await fetchCustomers();
    handleCloseEditDialog();
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const theme = useTheme();
  
  // Function to get initials from name
  const getInitials = (customer: Customer) => {
    if (customer.firstName) {
      return `${customer.firstName.charAt(0)}${customer.lastName ? customer.lastName.charAt(0) : ''}`;
    } else if (customer.name) {
      return customer.name.charAt(0);
    }
    return 'C';
  };
  
  // Function to get avatar color based on customer id
  const getAvatarColor = (id: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    return colors[id % colors.length];
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Card 
        elevation={2} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                Customer Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your customer database with ease
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchCustomers}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCustomerId(null);
                  setEditDialogOpen(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                Add New Customer
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading && customers.length === 0 ? (
        <Paper 
          elevation={2} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 6,
            borderRadius: 2,
            minHeight: 300
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Loading customers...</Typography>
          </Box>
        </Paper>
      ) : error && customers.length === 0 ? (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: 2, 
            py: 2,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">{error}</Typography>
        </Alert>
      ) : (
        <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'} Found
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loyalty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length > 0 ? (
                  customers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer, index) => (
                      <TableRow 
                        key={customer.id} 
                        hover
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            transition: 'background-color 0.2s ease'
                          }
                        }}
                      >
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getAvatarColor(customer.id),
                                width: 40,
                                height: 40,
                                boxShadow: `0 2px 8px ${alpha(getAvatarColor(customer.id), 0.4)}`
                              }}
                            >
                              {getInitials(customer)}
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="medium" 
                                component={Link} 
                                to={`/customers/${customer.id}`}
                                sx={{ 
                                  textDecoration: 'none', 
                                  color: 'inherit',
                                  '&:hover': { 
                                    color: theme.palette.primary.main,
                                    textDecoration: 'underline' 
                                  }
                                }}
                              >
                                {customer.firstName ? `${customer.firstName} ${customer.lastName}` : customer.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon fontSize="small" sx={{ fontSize: 14 }} />
                                ID: {customer.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="action" />
                              {customer.email}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              {customer.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                            <Typography variant="body2">{customer.address || 'No address provided'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Loyalty Points" arrow>
                            <Chip
                              icon={<LoyaltyIcon />}
                              label={customer.loyaltyPoints ?? 0}
                              color={(customer.loyaltyPoints ?? 0) > 100 ? "primary" : "default"}
                              variant={(customer.loyaltyPoints ?? 0) > 50 ? "filled" : "outlined"}
                              size="small"
                              sx={{ 
                                fontWeight: 'medium',
                                minWidth: 80
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details" arrow>
                              <IconButton 
                                component={Link}
                                to={`/customers/${customer.id}`}
                                color="info" 
                                aria-label="view customer details"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Customer" arrow>
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEditClick(customer.id)}
                                aria-label="edit customer"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Customer" arrow>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteClick(customer)}
                                aria-label="delete customer"
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <PersonIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary">No customers found</Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setSelectedCustomerId(null);
                            setEditDialogOpen(true);
                          }}
                          sx={{ mt: 1 }}
                        >
                          Add Your First Customer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontWeight: 'medium'
              }
            }}
          />
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
        TransitionProps={{
          style: { 
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <CustomerEditForm 
            customerId={selectedCustomerId} 
            onClose={handleCloseEditDialog}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: 450
          }
        }}
        TransitionProps={{
          style: { 
            transition: 'all 0.2s ease-in-out'
          }
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {customerToDelete && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  Confirm Delete
                </Typography>
                <IconButton 
                  aria-label="close" 
                  onClick={() => setDeleteDialogOpen(false)}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    width: 50,
                    height: 50
                  }}
                >
                  {getInitials(customerToDelete)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {customerToDelete.firstName ? `${customerToDelete.firstName} ${customerToDelete.lastName}` : customerToDelete.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customerToDelete.email}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Are you sure you want to delete this customer? This action <strong>cannot be undone</strong> and all associated data will be permanently removed.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2, 
                mt: 3 
              }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(211, 47, 47, 0.4)',
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Deleting...
                    </>
                  ) : 'Delete Customer'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 2
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerManagement;