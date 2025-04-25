import React from 'react';
import { useLocation } from 'react-router-dom';
import SuccessPage from '../components/common/SuccessPage';

interface LocationState {
  operation: 'create' | 'update' | 'delete';
  customerName?: string;
}

const CustomerSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  const operation = state?.operation || 'update';
  const customerName = state?.customerName || 'Customer';
  
  let title = '';
  let message = '';
  
  switch (operation) {
    case 'create':
      title = 'Customer Added Successfully!';
      message = `${customerName} has been successfully added to the system.`;
      break;
    case 'update':
      title = 'Customer Updated Successfully!';
      message = `${customerName}'s information has been successfully updated.`;
      break;
    case 'delete':
      title = 'Customer Deleted Successfully!';
      message = `${customerName} has been successfully removed from the system.`;
      break;
    default:
      title = 'Operation Successful!';
      message = 'The customer operation was completed successfully.';
  }
  
  return (
    <SuccessPage
      title={title}
      message={message}
      redirectPath="/customers"
      redirectText="Back to Customers"
      autoRedirectTime={3}
    />
  );
};

export default CustomerSuccessPage;