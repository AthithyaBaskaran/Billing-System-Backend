import React from 'react';
import SuccessPage from '../components/common/SuccessPage';

const SignupSuccessPage: React.FC = () => {
  return (
    <SuccessPage
      title="Registration Successful!"
      message="Your account has been successfully created. You can now log in to access the Billing System."
      redirectPath="/login"
      redirectText="Go to Login"
      autoRedirectTime={5}
    />
  );
};

export default SignupSuccessPage;