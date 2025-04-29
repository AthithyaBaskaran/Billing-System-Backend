import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BillList from '../billing/BillList';
import BillDetail from '../billing/BillDetail';
import BillForm from '../billing/BillForm';
import { Bill, BillingService } from '../../services/BillingService';
import { Customer } from '../../services/CustomerService';

enum BillView {
  LIST,
  DETAIL,
  CREATE,
  EDIT
}

interface CustomerBillsTabProps {
  customer: Customer;
}

const CustomerBillsTab: React.FC<CustomerBillsTabProps> = ({ customer }) => {
  const [currentView, setCurrentView] = useState<BillView>(BillView.LIST);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Delete functionality removed as per requirement
  
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

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setCurrentView(BillView.DETAIL);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setCurrentView(BillView.EDIT);
  };

  // Delete functionality removed as per requirement

  const handleCreateBill = () => {
    setSelectedBill(null);
    setCurrentView(BillView.CREATE);
  };

  const handleSaveBill = (bill: Bill) => {
    setNotification({
      open: true,
      message: `Bill ${bill.billNumber} ${selectedBill ? 'updated' : 'created'} successfully`,
      severity: 'success'
    });
    
    // Refresh the bill list and go back to it
    setRefreshTrigger(prev => prev + 1);
    setCurrentView(BillView.LIST);
  };

  const handleBackToList = () => {
    setCurrentView(BillView.LIST);
    setSelectedBill(null);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  const handleGenerateInvoice = async () => {
    if (!customer || !customer.id) return;
    
    try {
      setNotification({
        open: true,
        message: 'Generating invoice...',
        severity: 'info'
      });
      
      const response = await BillingService.generateCustomerInvoice(customer.id);
      
      if (response.statusCode >= 400) {
        setNotification({
          open: true,
          message: response.statusMessage || 'Failed to generate invoice',
          severity: 'error'
        });
      } else {
        setNotification({
          open: true,
          message: 'Invoice generated successfully',
          severity: 'success'
        });
        
        // If the API returns a URL or file data, we could handle it here
        // For example, opening a new window or downloading the file
        if (response.data && response.data.fileUrl) {
          window.open(response.data.fileUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      setNotification({
        open: true,
        message: 'An error occurred while generating the invoice',
        severity: 'error'
      });
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case BillView.DETAIL:
        return (
          <BillDetail 
            bill={selectedBill!} 
            onBack={handleBackToList} 
          />
        );
      
      case BillView.CREATE:
        return (
          <BillForm 
            onSave={handleSaveBill}
            onCancel={handleBackToList}
          />
        );
      
      case BillView.EDIT:
        return (
          <BillForm 
            billId={selectedBill!.id}
            onSave={handleSaveBill}
            onCancel={handleBackToList}
          />
        );
      
      case BillView.LIST:
      default:
        return (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              {/* <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={handleGenerateInvoice}
                color="secondary"
                sx={{ 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)',
                  }
                }}
              >
                Generate Invoice
              </Button> */}
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBill}
              >
                Create New Bill
              </Button>
            </Box>
            
            <BillList
              customerId={customer.id}
              onView={handleViewBill}
              refreshTrigger={refreshTrigger}
            />
          </>
        );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {renderContent()}
      
      {/* Delete functionality removed as per requirement */}
      
      {/* Notification Snackbar */}
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
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerBillsTab;