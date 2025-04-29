import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
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
  Badge,
  InputAdornment,
  OutlinedInput,
  FormControl,
  InputLabel,
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  MenuItem,
  Select,
  FormGroup
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';

const CustomerList: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Customer>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    minLoyaltyPoints: number | null;
    hasEmail: boolean | null;
    hasPhone: boolean | null;
  }>({
    minLoyaltyPoints: null,
    hasEmail: null,
    hasPhone: null
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAllCustomers();
      setCustomers(data);
      
      // Apply current filters and sorting to the new data
      let filtered = data;
      
      // Apply search if any
      if (searchTerm.trim() !== '') {
        filtered = filtered.filter(customer => {
          const fullName = customer.firstName 
            ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
            : (customer.name || '').toLowerCase();
          
          return (
            fullName.includes(searchTerm.toLowerCase()) ||
            (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.address || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      
      // Apply filters if any
      filtered = applyFilters(filtered);
      
      // Apply sorting
      filtered = sortCustomers(filtered, sortField, sortDirection);
      
      setFilteredCustomers(filtered);
      setError(null);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Customer data refreshed successfully',
        severity: 'success'
      });
    } catch (err) {
      setError('Failed to fetch customers. Please try again later.');
      console.error(err);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to refresh customer data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Apply sorting when sort parameters change
  useEffect(() => {
    if (customers.length > 0) {
      // Apply search if any
      let filtered = customers;
      if (searchTerm.trim() !== '') {
        filtered = filtered.filter(customer => {
          const fullName = customer.firstName 
            ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
            : (customer.name || '').toLowerCase();
          
          return (
            fullName.includes(searchTerm.toLowerCase()) ||
            (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.address || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      
      // Apply filters
      filtered = applyFilters(filtered);
      
      // Apply sorting
      filtered = sortCustomers(filtered, sortField, sortDirection);
      
      setFilteredCustomers(filtered);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortDirection, customers.length]);
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => {
      const fullName = customer.firstName 
        ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
        : (customer.name || '').toLowerCase();
      
      return (
        fullName.includes(value.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(value.toLowerCase()) ||
        (customer.phone || '').toLowerCase().includes(value.toLowerCase()) ||
        (customer.address || '').toLowerCase().includes(value.toLowerCase())
      );
    });
    
    setFilteredCustomers(filtered);
    setPage(0); // Reset to first page when searching
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
  
  // Sort customers
  const sortCustomers = (customers: Customer[], field: keyof Customer, direction: 'asc' | 'desc') => {
    return [...customers].sort((a, b) => {
      let valueA = a[field] || '';
      let valueB = b[field] || '';
      
      // Special handling for name field
      if (field === 'firstName' && a.firstName && b.firstName) {
        valueA = `${a.firstName} ${a.lastName || ''}`;
        valueB = `${b.firstName} ${b.lastName || ''}`;
      }
      
      // Convert to strings for comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      if (direction === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  };
  
  // Handle sort
  const handleSort = (field: keyof Customer) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = sortCustomers(filteredCustomers, field, newDirection);
    setFilteredCustomers(sorted);
    
    // Show notification
    setNotification({
      open: true,
      message: `Sorted by ${field} (${newDirection === 'asc' ? 'Ascending' : 'Descending'})`,
      severity: 'success'
    });
  };
  
  // Apply filters
  const applyFilters = (customers: Customer[]) => {
    return customers.filter(customer => {
      // Filter by minimum loyalty points
      if (filters.minLoyaltyPoints !== null && 
          (customer.loyaltyPoints === undefined || 
           customer.loyaltyPoints < filters.minLoyaltyPoints)) {
        return false;
      }
      
      // Filter by has email
      if (filters.hasEmail !== null) {
        const hasEmail = !!customer.email && customer.email.trim() !== '';
        if (filters.hasEmail !== hasEmail) {
          return false;
        }
      }
      
      // Filter by has phone
      if (filters.hasPhone !== null) {
        const hasPhone = !!customer.phone && customer.phone.trim() !== '';
        if (filters.hasPhone !== hasPhone) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Handle filter apply
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterDialogOpen(false);
    
    // Apply search and then filters
    let filtered = customers;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(customer => {
        const fullName = customer.firstName 
          ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
          : (customer.name || '').toLowerCase();
        
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.address || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply filters
    filtered = applyFilters(filtered);
    
    // Apply sorting
    filtered = sortCustomers(filtered, sortField, sortDirection);
    
    setFilteredCustomers(filtered);
    setPage(0); // Reset to first page
    
    // Show notification
    setNotification({
      open: true,
      message: `Filters applied: ${Object.values(newFilters).filter(v => v !== null).length} active filters`,
      severity: 'success'
    });
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      minLoyaltyPoints: null,
      hasEmail: null,
      hasPhone: null
    });
    
    // Reset to just search results without filters
    let filtered = customers;
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(customer => {
        const fullName = customer.firstName 
          ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
          : (customer.name || '').toLowerCase();
        
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.address || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply sorting
    filtered = sortCustomers(filtered, sortField, sortDirection);
    
    setFilteredCustomers(filtered);
    setFilterDialogOpen(false);
    
    // Show notification
    setNotification({
      open: true,
      message: 'All filters have been reset',
      severity: 'info'
    });
  };

  // Handle edit button click
  const handleEditClick = (customer: Customer) => {
    setCurrentCustomer(customer);
    setEditedCustomer({...customer});
    setEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentCustomer(null);
    setEditedCustomer(null);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof Customer, value: string) => {
    if (editedCustomer) {
      setEditedCustomer({
        ...editedCustomer,
        [field]: value
      });
    }
  };

  // Handle save customer
  const handleSaveCustomer = async () => {
    if (!editedCustomer || !currentCustomer) return;
    
    try {
      setLoading(true);
      await customerApi.updateCustomer(currentCustomer.id, editedCustomer);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Customer updated successfully!',
        severity: 'success'
      });
      
      // Refresh customer list
      await fetchCustomers();
      
      // Close dialog
      handleEditDialogClose();
    } catch (err) {
      console.error('Error updating customer:', err);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to update customer. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      setLoading(true);
      await customerApi.deleteCustomer(customerToDelete.id);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Customer deleted successfully!',
        severity: 'success'
      });
      
      // Refresh customer list
      await fetchCustomers();
      
      // Close dialog
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting customer:', err);
      
      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to delete customer. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="search-customer">Search Customers</InputLabel>
                <OutlinedInput
                  id="search-customer"
                  value={searchTerm}
                  onChange={handleSearch}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  }
                  label="Search Customers"
                  placeholder="Name, Email, Phone or Address"
                  sx={{ borderRadius: 2 }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
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
                  variant="outlined" 
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                  sx={{ 
                    borderRadius: 2,
                    ...(Object.values(filters).some(v => v !== null) && {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                    })
                  }}
                >
                  {Object.values(filters).some(v => v !== null) 
                    ? `Filters (${Object.values(filters).filter(v => v !== null).length})` 
                    : 'Filter'}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SortIcon />}
                  onClick={() => {
                    // Cycle through common sort fields
                    const sortFields: (keyof Customer)[] = ['firstName', 'email', 'loyaltyPoints', 'id'];
                    const currentIndex = sortFields.indexOf(sortField);
                    const nextField = sortFields[(currentIndex + 1) % sortFields.length];
                    handleSort(nextField);
                  }}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                >
                  {`Sort: ${sortField} (${sortDirection === 'asc' ? '↑' : '↓'})`}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && customers.length === 0 ? (
        <Card 
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
        </Card>
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
          {/* Customer Count Header */}
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Customer' : 'Customers'} Found
                {searchTerm && ` for "${searchTerm}"`}
              </Typography>
              
              {/* Active filters */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {sortField && (
                  <Chip 
                    size="small"
                    label={`Sorted by: ${sortField} (${sortDirection === 'asc' ? '↑' : '↓'})`}
                    color="primary"
                    variant="outlined"
                    onDelete={() => {
                      setSortField('id');
                      setSortDirection('asc');
                      const sorted = sortCustomers(filteredCustomers, 'id', 'asc');
                      setFilteredCustomers(sorted);
                    }}
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
                
                {filters.minLoyaltyPoints !== null && (
                  <Chip 
                    size="small"
                    label={`${filters.minLoyaltyPoints}+ Points`}
                    color="secondary"
                    variant="outlined"
                    onDelete={() => {
                      const newFilters = { ...filters, minLoyaltyPoints: null };
                      handleApplyFilters(newFilters);
                    }}
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
                
                {filters.hasEmail !== null && (
                  <Chip 
                    size="small"
                    label={filters.hasEmail ? "Has Email" : "No Email"}
                    color="info"
                    variant="outlined"
                    onDelete={() => {
                      const newFilters = { ...filters, hasEmail: null };
                      handleApplyFilters(newFilters);
                    }}
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
                
                {filters.hasPhone !== null && (
                  <Chip 
                    size="small"
                    label={filters.hasPhone ? "Has Phone" : "No Phone"}
                    color="success"
                    variant="outlined"
                    onDelete={() => {
                      const newFilters = { ...filters, hasPhone: null };
                      handleApplyFilters(newFilters);
                    }}
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
                
                {(filters.minLoyaltyPoints !== null || 
                  filters.hasEmail !== null || 
                  filters.hasPhone !== null) && (
                  <Chip 
                    size="small"
                    label="Clear All"
                    color="error"
                    variant="outlined"
                    onClick={handleResetFilters}
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Divider />
          
          {/* Customer Table */}
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="customer table">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      ...(sortField === 'firstName' && {
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      })
                    }}
                    onClick={() => handleSort('firstName')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Customer
                      {sortField === 'firstName' && (
                        <SortIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: 16,
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      ...(sortField === 'email' && {
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      })
                    }}
                    onClick={() => handleSort('email')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Contact Info
                      {sortField === 'email' && (
                        <SortIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: 16,
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      ...(sortField === 'address' && {
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      })
                    }}
                    onClick={() => handleSort('address')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Address
                      {sortField === 'address' && (
                        <SortIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: 16,
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                      ...(sortField === 'loyaltyPoints' && {
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      })
                    }}
                    onClick={() => handleSort('loyaltyPoints')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Loyalty
                      {sortField === 'loyaltyPoints' && (
                        <SortIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            fontSize: 16,
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer, index) => (
                      <TableRow 
                        hover 
                        key={customer.id}
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
                              <Typography variant="subtitle2" fontWeight="medium">
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
                            <Tooltip title="Edit Customer" arrow>
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEditClick(customer)}
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
                        {searchTerm && (
                          <Button 
                            variant="outlined" 
                            onClick={() => setSearchTerm('')}
                            sx={{ mt: 1 }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Divider />
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredCustomers.length}
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

      {/* Edit Customer Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditDialogClose} 
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
        <Box sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Edit Customer
            </Typography>
            <IconButton 
              aria-label="close" 
              onClick={handleEditDialogClose}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {editedCustomer && (
            <Typography variant="subtitle2" color="text.secondary">
              ID: {editedCustomer.id} • Created: {new Date().toLocaleDateString()}
            </Typography>
          )}
        </Box>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          {editedCustomer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      fontSize: 40,
                      mb: 2,
                      bgcolor: getAvatarColor(editedCustomer.id),
                      boxShadow: `0 8px 24px ${alpha(getAvatarColor(editedCustomer.id), 0.3)}`
                    }}
                  >
                    {getInitials(editedCustomer)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Customer Profile
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={editedCustomer.firstName || ''}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={editedCustomer.lastName || ''}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={editedCustomer.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={editedCustomer.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={editedCustomer.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Loyalty Points"
                      type="number"
                      value={editedCustomer.loyaltyPoints || 0}
                      onChange={(e) => handleFieldChange('loyaltyPoints', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LoyaltyIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2 
        }}>
          <Button 
            onClick={handleEditDialogClose}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomer} 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </Box>
      </Dialog>

      {/* Delete Customer Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteDialogClose}
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
                  onClick={handleDeleteDialogClose}
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
                  onClick={handleDeleteDialogClose}
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteCustomer} 
                  variant="contained" 
                  color="error"
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

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: 500
          }
        }}
      >
        <Box sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              Filter Customers
            </Typography>
            <IconButton 
              aria-label="close" 
              onClick={() => setFilterDialogOpen(false)}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Set criteria to filter the customer list
          </Typography>
        </Box>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Loyalty Points
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={filters.minLoyaltyPoints !== null ? filters.minLoyaltyPoints : 0}
                  onChange={(_, value) => 
                    setFilters({
                      ...filters, 
                      minLoyaltyPoints: value as number > 0 ? value as number : null
                    })
                  }
                  valueLabelDisplay="auto"
                  step={10}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                    { value: 200, label: '200+' }
                  ]}
                  min={0}
                  max={200}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {filters.minLoyaltyPoints !== null 
                    ? `Show customers with ${filters.minLoyaltyPoints}+ loyalty points` 
                    : 'No minimum loyalty points filter'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Contact Information
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={filters.hasEmail === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, hasEmail: true });
                        } else if (filters.hasEmail === true) {
                          setFilters({ ...filters, hasEmail: null });
                        } else {
                          setFilters({ ...filters, hasEmail: false });
                        }
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {filters.hasEmail === true 
                          ? "Has Email" 
                          : filters.hasEmail === false 
                            ? "No Email" 
                            : "Any Email Status"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.hasEmail === true 
                          ? "Only customers with email addresses" 
                          : filters.hasEmail === false 
                            ? "Only customers without email addresses" 
                            : "Both with and without email addresses"}
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={filters.hasPhone === true}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, hasPhone: true });
                        } else if (filters.hasPhone === true) {
                          setFilters({ ...filters, hasPhone: null });
                        } else {
                          setFilters({ ...filters, hasPhone: false });
                        }
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {filters.hasPhone === true 
                          ? "Has Phone" 
                          : filters.hasPhone === false 
                            ? "No Phone" 
                            : "Any Phone Status"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filters.hasPhone === true 
                          ? "Only customers with phone numbers" 
                          : filters.hasPhone === false 
                            ? "Only customers without phone numbers" 
                            : "Both with and without phone numbers"}
                      </Typography>
                    </Box>
                  }
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={handleResetFilters}
            variant="outlined"
            color="inherit"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Reset Filters
          </Button>
          
          <Button 
            onClick={() => handleApplyFilters(filters)}
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="notification-animation"
      >
        <Alert 
          onClose={handleNotificationClose} 
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

export default CustomerList;