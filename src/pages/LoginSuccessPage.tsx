import React from 'react';
import SuccessPage from '../components/common/SuccessPage';

const LoginSuccessPage: React.FC = () => {
  return (
    <SuccessPage
      title="Login Successful!"
      message="You have successfully logged into your account. Welcome back to the Billing System."
      redirectPath="/dashboard"
      redirectText="Go to Dashboard"
      autoRedirectTime={3}
    />
  );
};

export default LoginSuccessPage;