import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { theme as getTheme } from './theme/theme';
import { checkAuth } from './redux/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import BankDetails from './pages/BankDetails';
import GenerateInvoice from './pages/GenerateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoicesList from './pages/InvoicesList';
import InvoicePreview from './pages/InvoicePreview';

// Default to dark theme
const currentTheme = getTheme('dark');

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (appLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline enableColorScheme />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ 
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Background glow effect */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            
            {/* Logo/Brand */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: '#1e293b',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative',
              }}
            >
              <Typography 
                sx={{ 
                  color: '#60a5fa',
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: '-0.5px'
                }}
              >
                G
              </Typography>
            </Box>
            
            {/* Loading text and spinner */}
            <Box sx={{ position: 'relative' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 3,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.025em',
                }}
              >
                GST Billing
              </Typography>
              
              <CircularProgress 
                size={24}
                thickness={4}
                sx={{ 
                  color: '#3b82f6',
                  mb: 2
                }}
              />
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  display: 'block',
                  mt: 1
                }}
              >
                Loading system
              </Typography>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline enableColorScheme />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="bank-details" element={<BankDetails />} />
            <Route path="generate-invoice" element={<GenerateInvoice />} />
            <Route path="edit-invoice/:id" element={<EditInvoice />} />
            <Route path="invoices" element={<InvoicesList />} />
            <Route path="invoice/:id" element={<InvoicePreview />} />
          </Route>

          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;