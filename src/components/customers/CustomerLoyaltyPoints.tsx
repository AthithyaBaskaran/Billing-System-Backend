import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Grid,
  TablePagination
} from '@mui/material';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';

const CustomerLoyaltyPoints: React.FC = () => {
  // State for loyalty points search
  const [pointsThreshold, setPointsThreshold] = useState<string>('100');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for updating loyalty points
  const [customerId, setCustomerId] = useState<string>('');
  const [newPoints, setNewPoints] = useState<string>('');
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  // Handle loyalty points search
  const handlePointsThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPointsThreshold(event.target.value);
  };

  const handleSearch = async () => {
    if (!pointsThreshold.trim()) {
      setSearchError('Please enter a points threshold');
      return;
    }

    const points = parseInt(pointsThreshold, 10);
    if (isNaN(points) || points < 0) {
      setSearchError('Please enter a valid number for points threshold');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setCustomers([]);
    setSearched(true);

    try {
      const results = await customerApi.getCustomersWithLoyaltyPointsAbove(points);
      setCustomers(results);
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'An error occurred while searching for customers');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle loyalty points update
  const handleCustomerIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(event.target.value);
  };
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNewPointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPoints(event.target.value);
  };

  const handleUpdate = async () => {
    if (!customerId.trim()) {
      setUpdateError('Please enter a customer ID');
      return;
    }

    if (!newPoints.trim()) {
      setUpdateError('Please enter new loyalty points');
      return;
    }

    const id = parseInt(customerId, 10);
    const points = parseInt(newPoints, 10);

    if (isNaN(id) || id <= 0) {
      setUpdateError('Please enter a valid customer ID');
      return;
    }

    if (isNaN(points) || points < 0) {
      setUpdateError('Please enter a valid number for loyalty points');
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdatedCustomer(null);
    setUpdated(true);

    try {
      const result = await customerApi.updateCustomerLoyaltyPoints(id, points);
      setUpdatedCustomer(result);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'An error occurred while updating loyalty points');
      console.error('Update error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Render customer search results
  const renderCustomerResults = () => {
    if (customers.length === 0) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Results ({customers.length} customers found)
          </Typography>
          
          <TableContainer>
            <Table aria-label="customer search results">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Loyalty Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>
                        {customer.firstName ? 
                          `${customer.firstName} ${customer.lastName}` : 
                          customer.name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.loyaltyPoints}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    );
  };

  // Render updated customer details
  const renderUpdatedCustomer = () => {
    if (!updatedCustomer) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Updated Customer Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography><strong>ID:</strong> {updatedCustomer.id}</Typography>
            <Typography>
              <strong>Name:</strong> {updatedCustomer.firstName ? 
                `${updatedCustomer.firstName} ${updatedCustomer.lastName}` : 
                updatedCustomer.name}
            </Typography>
            <Typography><strong>Email:</strong> {updatedCustomer.email}</Typography>
            <Typography><strong>Phone:</strong> {updatedCustomer.phone}</Typography>
            <Typography><strong>Loyalty Points:</strong> {updatedCustomer.loyaltyPoints}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Loyalty Points Management
      </Typography>
      
      <Grid container spacing={3}>
        {/* Search by loyalty points section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Find Customers by Loyalty Points
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Minimum Points Threshold"
                  variant="outlined"
                  type="number"
                  value={pointsThreshold}
                  onChange={handlePointsThresholdChange}
                  placeholder="e.g., 100"
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  disabled={searchLoading}
                  sx={{ 
                    height: { sm: '56px' }, 
                    minWidth: '100px',
                    alignSelf: { xs: 'stretch', sm: 'auto' }
                  }}
                >
                  {searchLoading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>
              
              {searchLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {searchError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {searchError}
                </Alert>
              )}
              
              {searched && !searchLoading && !searchError && customers.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No customers found with loyalty points above {pointsThreshold}.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Update loyalty points section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Customer Loyalty Points
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Customer ID"
                  variant="outlined"
                  type="number"
                  value={customerId}
                  onChange={handleCustomerIdChange}
                  placeholder="e.g., 1"
                />
                
                <TextField
                  fullWidth
                  label="New Loyalty Points"
                  variant="outlined"
                  type="number"
                  value={newPoints}
                  onChange={handleNewPointsChange}
                  placeholder="e.g., 150"
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {updateLoading ? <CircularProgress size={24} /> : 'Update Points'}
                </Button>
              </Box>
              
              {updateLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {updateError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {updateError}
                </Alert>
              )}
              
              {updated && !updateLoading && !updateError && !updatedCustomer && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Customer not found.
                </Alert>
              )}
              
              {updated && !updateLoading && !updateError && updatedCustomer && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Loyalty points updated successfully!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Results sections */}
      {renderCustomerResults()}
      {renderUpdatedCustomer()}
    </Paper>
  );
};

export default CustomerLoyaltyPoints;