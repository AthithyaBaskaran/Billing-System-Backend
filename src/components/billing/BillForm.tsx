import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BillingService, Bill, BillItem, ApiBillItem, ApiResponseBillItem } from '../../services/BillingService';
import { CustomerService, Customer } from '../../services/CustomerService';
import { ProductService, Product } from '../../services/ProductService';

interface BillFormProps {
  billId?: number;
  onSave?: (bill: Bill) => void;
  onCancel?: () => void;
}

const BILL_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'OTHER', label: 'Other' }
];

const DEFAULT_BILL_ITEM: BillItem = {
  productId: 0,
  productName: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  tax: 0,
  total: 0
};

const BillForm: React.FC<BillFormProps> = ({ billId, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Bill state
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [status, setStatus] = useState<string>('PENDING');
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD');
  const [items, setItems] = useState<BillItem[]>([{ ...DEFAULT_BILL_ITEM }]);
  
  // Calculated totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch customers and products
        const [customersData, productsData] = await Promise.all([
          CustomerService.getAllCustomers(),
          ProductService.getAllProducts()
        ]);
        
        setCustomers(customersData);
        setProducts(productsData);
        
        // If editing an existing bill, fetch its data
        if (billId) {
          const billData = await BillingService.getBillById(billId);
          
          // Populate form with bill data
          setBillNumber(billData.billNumber);
          setBillDate(new Date(billData.billDate));
          if (billData.dueDate) {
            setDueDate(new Date(billData.dueDate));
          }
          setStatus(billData.paymentStatus);
          setPaymentMethod(billData.paymentMethod || 'CREDIT_CARD');
          
          // Convert API response items to frontend BillItem format if needed
          const convertedItems = billData.items.map(item => {
            // Check if the item is already in the frontend format
            if ('productId' in item) {
              return item as BillItem;
            }
            
            // Convert from API format to frontend format
            const apiItem = item as unknown as ApiResponseBillItem;
            return {
              id: apiItem.id,
              productId: apiItem.product.id,
              productName: apiItem.product.name || '',
              quantity: apiItem.quantity,
              unitPrice: apiItem.unitPrice,
              discount: apiItem.discountAmount,
              tax: apiItem.lineTotal - (apiItem.quantity * apiItem.unitPrice) + apiItem.discountAmount,
              total: apiItem.lineTotal
            } as BillItem;
          });
          
          setItems(convertedItems);
          
          // Find and set the selected customer
          const customer = customersData.find(c => c.id === billData.customer.id) || null;
          setSelectedCustomer(customer);
          
          // Set calculated values
          setSubtotal(billData.subtotal);
          setTaxAmount(billData.taxAmount);
          setDiscountAmount(billData.discountAmount);
          setTotalAmount(billData.totalAmount);
        } else {
          // Generate a new bill number for new bills
          generateBillNumber();
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [billId]);

  // Recalculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [items]);

  // Generate a unique bill number
  const generateBillNumber = () => {
    const prefix = 'INV';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setBillNumber(`${prefix}-${timestamp}-${random}`);
  };

  // Calculate all totals based on items
  const calculateTotals = () => {
    let newSubtotal = 0;
    let newTaxAmount = 0;
    let newDiscountAmount = 0;
    
    items.forEach(item => {
      newSubtotal += item.quantity * item.unitPrice;
      newTaxAmount += item.tax;
      newDiscountAmount += item.discount;
    });
    
    const newTotalAmount = newSubtotal + newTaxAmount - newDiscountAmount;
    
    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setDiscountAmount(newDiscountAmount);
    setTotalAmount(newTotalAmount);
  };

  // Add a new empty item to the bill
  const handleAddItem = () => {
    setItems([...items, { ...DEFAULT_BILL_ITEM }]);
  };

  // Remove an item from the bill
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update an item's data
  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // If product is selected, update product name and unit price
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productName = product.name;
        item.unitPrice = product.price;
      }
    }
    
    // Recalculate item total
    if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
      const subtotal = item.quantity * item.unitPrice;
      item.total = subtotal + item.tax - item.discount;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }
    
    if (items.length === 0) {
      setError('Please add at least one item to the bill');
      return;
    }
    
    if (!billDate || !dueDate) {
      setError('Please select valid dates');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (billId) {
        // For updating existing bills, use the original method
        const billData: Bill = {
          id: billId,
          billNumber,
          customer: selectedCustomer,
          billDate: billDate.toISOString(),
          dueDate: dueDate.toISOString(),
          items,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentStatus: status as any,
          paymentMethod
        };
        
        response = await BillingService.updateBill(billId, billData);
      } else {
        // For creating new bills, use the new API endpoint
        // Convert BillItem[] to ApiBillItem[]
        const apiBillItems: ApiBillItem[] = items.map(item => ({
          product: { id: item.productId },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discount
        }));
        
        response = await BillingService.createBillWithItems(
          selectedCustomer.id,
          apiBillItems,
          paymentMethod
        );
      }
      
      if (response.statusCode >= 400) {
        setError(response.statusMessage || 'Failed to save bill');
      } else if (onSave) {
        onSave(response.data);
      }
    } catch (err) {
      console.error('Error saving bill:', err);
      setError('Failed to save bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onCancel}
              variant="text"
              size="small"
            >
              Back
            </Button>
            
            <Typography variant="h6">
              {billId ? 'Edit Bill' : 'Create New Bill'}
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Bill Number"
                  fullWidth
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  required
                  disabled
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}} (${option.email || 'No email'})`}
                  value={selectedCustomer}
                  onChange={(_, newValue) => setSelectedCustomer(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      required
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Bill Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  required
                  value={billDate ? billDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setBillDate(new Date(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  required
                  value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDueDate(new Date(e.target.value))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  margin="normal"
                >
                  {BILL_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Payment Method"
                  fullWidth
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                  margin="normal"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Bill Items
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    variant="outlined"
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
                
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price ($)</TableCell>
                        <TableCell align="right">Discount ($)</TableCell>
                        <TableCell align="right">Tax ($)</TableCell>
                        <TableCell align="right">Total ($)</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              options={products}
                              getOptionLabel={(option) => option.name}
                              value={products.find(p => p.id === item.productId) || null}
                              onChange={(_, newValue) => {
                                handleItemChange(index, 'productId', newValue?.id || 0);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  required
                                />
                              )}
                              sx={{ minWidth: 200 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              inputProps={{ min: 1 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, 'tax', Number(e.target.value))}
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {item.total.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              disabled={items.length === 1}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              

              
              <Grid item xs={12} md={6}>
                <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 2, mt: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">${subtotal.toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Discount:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">-${discountAmount.toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">${taxAmount.toFixed(2)}</Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Total:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" align="right">${totalAmount.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : null}
                  >
                    {saving ? 'Saving...' : (billId ? 'Update Bill' : 'Create Bill')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
  );
};

export default BillForm;