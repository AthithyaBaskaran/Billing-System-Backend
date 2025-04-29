import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tooltip,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ProductService, Product } from '../../services/ProductService';

interface ProductListProps {
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  refreshTrigger?: number; // A value that changes to trigger a refresh
}

const ProductList: React.FC<ProductListProps> = ({ onEdit, onDelete, refreshTrigger = 0 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    console.log('ProductList refreshing, trigger:', refreshTrigger);
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term) ||
          product.barcode?.toLowerCase().includes(term) ||
          product.id?.toString().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleEditClick = (product: Product) => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDeleteClick = (product: Product) => {
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Product List
          </Typography>
          
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search products by name, description, category, or barcode..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Alert severity="info">
            No products found. {searchTerm ? 'Try a different search term.' : ''}
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Barcode</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product,index) => (
                  <TableRow key={product.id} hover>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {product.description.length > 50 
                          ? `${product.description.substring(0, 50)}...` 
                          : product.description}
                      </Typography>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.stockQuantity} 
                        size="small"
                        color={product.stockQuantity > 10 ? "success" : product.stockQuantity > 0 ? "warning" : "error"}
                        variant={product.stockQuantity > 0 ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <Chip 
                          label={product.category} 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{product.barcode || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditClick(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;