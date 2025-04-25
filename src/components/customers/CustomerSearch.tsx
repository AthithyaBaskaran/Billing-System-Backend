import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { customerApi } from '../../Api/customerApi';
import { Customer } from '../../types/api.types';

type SearchType = 'id' | 'email' | 'phone';

const CustomerSearch: React.FC = () => {
  const [searchType, setSearchType] = useState<SearchType>('id');
  const [searchValue, setSearchValue] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearchTypeChange = (event: SelectChangeEvent) => {
    setSearchType(event.target.value as SearchType);
    setSearchValue('');
  };

  const handleSearchValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError(null);
    setCustomer(null);
    setSearched(true);

    try {
      let result: Customer;

      switch (searchType) {
        case 'id':
          const id = parseInt(searchValue, 10);
          if (isNaN(id)) {
            throw new Error('Invalid ID format');
          }
          result = await customerApi.getCustomerById(id);
          break;
        case 'email':
          result = await customerApi.getCustomerByEmail(searchValue);
          break;
        case 'phone':
          result = await customerApi.getCustomerByPhone(searchValue);
          break;
        default:
          throw new Error('Invalid search type');
      }

      setCustomer(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Customer not found or an error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerDetails = () => {
    if (!customer) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography><strong>ID:</strong> {customer.id}</Typography>
            <Typography><strong>Name:</strong> {customer.firstName} {customer.lastName}</Typography>
            <Typography><strong>Email:</strong> {customer.email}</Typography>
            <Typography><strong>Phone:</strong> {customer.phone}</Typography>
            <Typography><strong>Address:</strong> {customer.address}</Typography>
            {customer.loyaltyPoints !== undefined && (
              <Typography><strong>Loyalty Points:</strong> {customer.loyaltyPoints}</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Customer Search
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120, flex: { sm: '0 0 150px' } }}>
          <InputLabel id="search-type-label">Search By</InputLabel>
          <Select
            labelId="search-type-label"
            id="search-type"
            value={searchType}
            label="Search By"
            onChange={handleSearchTypeChange}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="phone">Phone</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label={`Enter Customer ${searchType.toUpperCase()}`}
          variant="outlined"
          value={searchValue}
          onChange={handleSearchValueChange}
          type={searchType === 'id' ? 'number' : 'text'}
          placeholder={
            searchType === 'id' 
              ? 'e.g., 1' 
              : searchType === 'email' 
                ? 'e.g., customer@example.com' 
                : 'e.g., 1234567890'
          }
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
      
      {searched && !loading && !error && !customer && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No customer found with the provided information.
        </Alert>
      )}
      
      {renderCustomerDetails()}
    </Paper>
  );
};

export default CustomerSearch;