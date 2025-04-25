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
  TablePagination
} from '@mui/material';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';

const CustomerNameSearch: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(event.target.value);
  };

  const handleSearch = async () => {
    if (!firstName.trim()) {
      setError('Please enter a first name to search');
      return;
    }

    setLoading(true);
    setError(null);
    setCustomers([]);
    setSearched(true);

    try {
      const results = await customerApi.searchCustomersByFirstName(firstName);
      setCustomers(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while searching for customers');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

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
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>
                      {customer.firstName ? 
                        `${customer.firstName} ${customer.lastName}` : 
                        customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Search Customers by First Name
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Enter First Name"
          variant="outlined"
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder="e.g., John"
        />
        
        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={loading}
          sx={{ 
            height: { sm: '56px' }, 
            minWidth: '100px',
            alignSelf: { xs: 'stretch', sm: 'auto' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {searched && !loading && !error && customers.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No customers found with the first name "{firstName}".
        </Alert>
      )}
      
      {renderCustomerResults()}
    </Paper>
  );
};

export default CustomerNameSearch;