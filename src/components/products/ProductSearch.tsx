import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import { ProductService, Product } from '../../services/ProductService';

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void;
}

type SearchTab = 'specific' | 'name' | 'category' | 'lowStock';

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [activeTab, setActiveTab] = useState<SearchTab>('specific');
  
  // Specific product search (by ID or barcode)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'barcode'>('barcode');
  const [product, setProduct] = useState<Product | null>(null);
  
  // Name search
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [nameSearchResults, setNameSearchResults] = useState<Product[]>([]);
  
  // Category search
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Low stock search
  const [stockThreshold, setStockThreshold] = useState<string>("10");
  const [lowStockResults, setLowStockResults] = useState<Product[]>([]);
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch available categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const products = await ProductService.getAllProducts();
        const categories = [...new Set(products
          .map(p => p.category)
          .filter(c => c && c.trim() !== '') as string[]
        )];
        setAvailableCategories(categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: SearchTab) => {
    setActiveTab(newValue);
    setError(null);
  };

  // Specific product search (by ID or barcode)
  const handleSpecificSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      let result: Product;

      if (searchType === 'id') {
        const id = parseInt(searchTerm);
        if (isNaN(id)) {
          setError('Please enter a valid ID');
          setLoading(false);
          return;
        }
        result = await ProductService.getProductById(id);
      } else {
        result = await ProductService.getProductByBarcode(searchTerm);
      }

      setProduct(result);
      
      if (onProductSelect) {
        onProductSelect(result);
      }
    } catch (err) {
      console.error('Error searching for product:', err);
      setError('Product not found. Please check your search term and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSpecific = () => {
    setSearchTerm('');
    setError(null);
    setProduct(null);
  };

  const handleSpecificKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSpecificSearch();
    }
  };
  
  // Name search
  const handleNameSearch = async () => {
    if (!nameSearchTerm.trim()) {
      setError('Please enter a product name to search');
      return;
    }
    
    setLoading(true);
    setError(null);
    setNameSearchResults([]);
    
    try {
      const results = await ProductService.searchProductsByName(nameSearchTerm);
      setNameSearchResults(results);
      
      if (results.length === 0) {
        setError(`No products found matching "${nameSearchTerm}"`);
      }
    } catch (err) {
      console.error('Error searching products by name:', err);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearName = () => {
    setNameSearchTerm('');
    setError(null);
    setNameSearchResults([]);
  };
  
  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSearch();
    }
  };
  
  // Category search
  const handleCategorySearch = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCategorySearchResults([]);
    
    try {
      const results = await ProductService.getProductsByCategory(selectedCategory);
      setCategorySearchResults(results);
      
      if (results.length === 0) {
        setError(`No products found in category "${selectedCategory}"`);
      }
    } catch (err) {
      console.error('Error fetching products by category:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Low stock search
  const handleLowStockSearch = async () => {
    setLoading(true);
    setError(null);
    setLowStockResults([]);
    
    try {
      // Convert to number for API call, default to 10 if not a valid number
      const threshold = parseInt(stockThreshold) || 10;
      const results = await ProductService.getLowStockProducts(threshold);
      setLowStockResults(results);
      
      if (results.length === 0) {
        setError(`No products found with stock below ${stockThreshold}`);
      }
    } catch (err) {
      console.error('Error fetching low stock products:', err);
      setError('Failed to fetch low stock products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render product details card
  const renderProductDetails = (product: Product) => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {product.name}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {product.id}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Price
            </Typography>
            <Typography variant="body1" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Stock Quantity
            </Typography>
            <Typography variant="body1" gutterBottom>
              {product.stockQuantity}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" gutterBottom>
              {product.category || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Barcode
            </Typography>
            <Typography variant="body1" gutterBottom>
              {product.barcode || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {product.description}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  // Render products table
  const renderProductsTable = (products: Product[]) => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Barcode</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>{product.id}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Product Search
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<SearchIcon />} 
            iconPosition="start" 
            label="Find Specific Product" 
            value="specific"
          />
          <Tab 
            icon={<SearchIcon />} 
            iconPosition="start" 
            label="Search by Name" 
            value="name"
          />
          <Tab 
            icon={<CategoryIcon />} 
            iconPosition="start" 
            label="Browse by Category" 
            value="category"
          />
          <Tab 
            icon={<WarningIcon />} 
            iconPosition="start" 
            label="Low Stock Products" 
            value="lowStock"
          />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Specific Product Search */}
        {activeTab === 'specific' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Enter Barcode or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSpecificKeyPress}
                variant="outlined"
                placeholder={searchType === 'barcode' ? "Enter barcode..." : "Enter product ID..."}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleClearSpecific}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSpecificSearch}
                disabled={loading || !searchTerm.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchType(searchType === 'barcode' ? 'id' : 'barcode');
                  setSearchTerm('');
                  setError(null);
                  setProduct(null);
                }}
              >
                Search by {searchType === 'barcode' ? 'ID' : 'Barcode'}
              </Button>
            </Box>
            
            {product && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                
                {renderProductDetails(product)}
              </Box>
            )}
          </Box>
        )}
        
        {/* Name Search */}
        {activeTab === 'name' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Search by Product Name"
                value={nameSearchTerm}
                onChange={(e) => setNameSearchTerm(e.target.value)}
                onKeyPress={handleNameKeyPress}
                variant="outlined"
                placeholder="Enter product name..."
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: nameSearchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={handleClearName}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNameSearch}
                disabled={loading || !nameSearchTerm.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search Products'}
              </Button>
            </Box>
            
            {nameSearchResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Search Results ({nameSearchResults.length})
                </Typography>
                
                {renderProductsTable(nameSearchResults)}
              </Box>
            )}
          </Box>
        )}
        
        {/* Category Search */}
        {activeTab === 'category' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-select-label">Select Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Select Category"
                  disabled={loading || availableCategories.length === 0}
                >
                  {availableCategories.length === 0 ? (
                    <MenuItem value="" disabled>
                      No categories available
                    </MenuItem>
                  ) : (
                    availableCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCategorySearch}
                disabled={loading || !selectedCategory}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CategoryIcon />}
              >
                {loading ? 'Searching...' : 'Browse Category'}
              </Button>
            </Box>
            
            {categorySearchResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Products in "{selectedCategory}" ({categorySearchResults.length})
                </Typography>
                
                {renderProductsTable(categorySearchResults)}
              </Box>
            )}
          </Box>
        )}
        
        {/* Low Stock Search */}
        {activeTab === 'lowStock' && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Stock Threshold"
                type="text"
                value={stockThreshold}
                onChange={(e) => setStockThreshold(e.target.value)}
                variant="outlined"
                placeholder="Enter threshold value..."
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon color="action" />
                    </InputAdornment>
                  )
                }}
                helperText="Show products with stock quantity below this value"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLowStockSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WarningIcon />}
              >
                {loading ? 'Searching...' : 'Find Low Stock Products'}
              </Button>
            </Box>
            
            {lowStockResults.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Low Stock Products (Below {stockThreshold}) ({lowStockResults.length})
                </Typography>
                
                {renderProductsTable(lowStockResults)}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSearch;