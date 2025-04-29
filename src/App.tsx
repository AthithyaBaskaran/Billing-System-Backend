import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ProductsPage from './pages/ProductsPage';
import BillingPage from './pages/BillingPage';
import BillFilterPage from './pages/BillFilterPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import CustomerSuccessPage from './pages/CustomerSuccessPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login-success" element={<LoginSuccessPage />} />
            <Route path="/signup-success" element={<SignupSuccessPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/customer-success" element={<CustomerSuccessPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/bill-filters" element={<BillFilterPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              {/* Add more protected routes here */}
            </Route>
            
            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
