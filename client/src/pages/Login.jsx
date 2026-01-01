import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { login, clearError } from '../redux/slices/authSlice';
import { useSnackbar } from 'notistack';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap();
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      enqueueSnackbar(error || 'Login failed', { variant: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        py: 2,
        px: 1,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={500} sx={{ mb: 1, color: '#f1f5f9' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontSize: '0.875rem',
                '& .MuiAlert-icon': {
                  color: '#f87171'
                }
              }}
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  fontSize: '0.875rem',
                  '&:hover fieldset': {
                    borderColor: '#475569',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    borderWidth: '1px'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#3b82f6'
                  }
                }
              }}
              InputProps={{
                sx: {
                  color: '#f1f5f9'
                }
              }}
              FormHelperTextProps={{
                sx: {
                  fontSize: '0.75rem',
                  color: errors.email ? '#f87171' : '#94a3b8'
                }
              }}
              variant="outlined"
            />

            {/* Password Field */}
            <TextField
              fullWidth
              size="small"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  fontSize: '0.875rem',
                  '&:hover fieldset': {
                    borderColor: '#475569',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                    borderWidth: '1px'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#3b82f6'
                  }
                }
              }}
              InputProps={{
                sx: {
                  color: '#f1f5f9'
                },
                endAdornment: (
                  <Box
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      color: '#94a3b8',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </Box>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  fontSize: '0.75rem',
                  color: errors.password ? '#f87171' : '#94a3b8'
                }
              }}
              variant="outlined"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="small"
              disabled={loading}
              sx={{
                py: 1,
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                minHeight: 40,
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#334155',
                  color: '#64748b',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: '1px solid #334155'
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b', 
                display: 'block', 
                fontWeight: 500,
                mb: 1,
                fontSize: '0.75rem'
              }}
            >
              Demo Credentials
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#94a3b8',
                lineHeight: 1.6,
                fontSize: '0.75rem',
              }}
            >
              Email: demo@gstbilling.com<br />
              Password: demo123
            </Typography>
          </Box>

          {/* Sign Up Link */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #334155' }}>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#3b82f6'
                  }
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}