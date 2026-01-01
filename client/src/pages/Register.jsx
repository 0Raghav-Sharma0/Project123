import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { register, clearError } from '../redux/slices/authSlice';
import { useSnackbar } from 'notistack';

const steps = ['Business', 'Account'];

const companySchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  gstNumber: yup
    .string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .required('GST number is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    pincode: yup
      .string()
      .matches(/^[1-9][0-9]{5}$/, 'Invalid pincode')
      .required('Pincode is required'),
  }),
  contact: yup.object({
    email: yup.string().email('Invalid email'),
    phone: yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number'),
  }),
});

const accountSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    formState: { errors: companyErrors },
    getValues: getCompanyValues,
  } = useForm({
    resolver: yupResolver(companySchema),
  });

  const {
    register: registerAccount,
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors },
    getValues: getAccountValues,
  } = useForm({
    resolver: yupResolver(accountSchema),
  });

  const handleNext = () => {
    if (activeStep === 0) {
      handleCompanySubmit(() => setActiveStep(1))();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const onFinalSubmit = async () => {
    try {
      const companyData = getCompanyValues();
      const accountData = getAccountValues();
      
      console.log('Registration data being sent:', {
        email: accountData.email,
        password: accountData.password,
        companyName: companyData.companyName,
        gstNumber: companyData.gstNumber,
        address: companyData.address,
        contact: companyData.contact,
      });

      const registrationData = {
        email: accountData.email,
        password: accountData.password,
        companyName: companyData.companyName,
        gstNumber: companyData.gstNumber,
        address: companyData.address,
        contact: companyData.contact,
      };

      const result = await dispatch(register(registrationData)).unwrap();
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      enqueueSnackbar(error || 'Registration failed', { variant: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
        py: 2,
        px: 1,
      }}
    >
      <Container maxWidth="md" sx={{ height: '100%' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1,
              bgcolor: '#1e293b',
              border: '1px solid',
              borderColor: '#334155',
              height: 'auto',
              maxHeight: '90vh',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#0f172a',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#475569',
                borderRadius: '2px',
              },
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, color: '#f8fafc' }}>
                Create Business Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Register your company to get started
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 2.5,
                '& .MuiStepIcon-root': {
                  width: 22,
                  height: 22,
                  color: '#334155',
                  '&.Mui-active': {
                    color: '#3b82f6',
                  },
                  '&.Mui-completed': {
                    color: '#334155',
                  },
                },
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  '&.Mui-active': {
                    color: '#f8fafc',
                    fontWeight: 600,
                  },
                  '&.Mui-completed': {
                    color: '#94a3b8',
                  },
                },
                '& .MuiStepConnector-line': {
                  borderColor: '#334155',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 0.75,
                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  py: 0.75,
                  fontSize: '0.875rem',
                  color: '#fca5a5',
                  '& .MuiAlert-icon': {
                    color: '#ef4444',
                  },
                }}
                onClose={() => dispatch(clearError())}
              >
                {error}
              </Alert>
            )}

            {/* Step 1: Company Details */}
            {activeStep === 0 && (
              <motion.div
                key="company"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Grid container spacing={1.5}>
                  {/* Company Info Section */}
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#f1f5f9' }}>
                      Company Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Company Name"
                      {...registerCompany('companyName')}
                      error={!!companyErrors.companyName}
                      helperText={companyErrors.companyName?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="GST Number"
                      placeholder="27AABCD1234A1Z5"
                      {...registerCompany('gstNumber')}
                      error={!!companyErrors.gstNumber}
                      helperText={companyErrors.gstNumber?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  {/* Address Section */}
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1, mb: 1, color: '#f1f5f9' }}>
                      Business Address
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Street Address"
                      {...registerCompany('address.street')}
                      error={!!companyErrors.address?.street}
                      helperText={companyErrors.address?.street?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="City"
                      {...registerCompany('address.city')}
                      error={!!companyErrors.address?.city}
                      helperText={companyErrors.address?.city?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="State"
                      {...registerCompany('address.state')}
                      error={!!companyErrors.address?.state}
                      helperText={companyErrors.address?.state?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Pincode"
                      {...registerCompany('address.pincode')}
                      error={!!companyErrors.address?.pincode}
                      helperText={companyErrors.address?.pincode?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  {/* Contact Section */}
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 1, mb: 1, color: '#f1f5f9' }}>
                      Contact Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Contact Email"
                      type="email"
                      {...registerCompany('contact.email')}
                      error={!!companyErrors.contact?.email}
                      helperText={companyErrors.contact?.email?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone Number"
                      {...registerCompany('contact.phone')}
                      error={!!companyErrors.contact?.phone}
                      helperText={companyErrors.contact?.phone?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Step 2: Account Information */}
            {activeStep === 1 && (
              <motion.div
                key="account"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#f1f5f9' }}>
                      Account Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email Address"
                      type="email"
                      {...registerAccount('email')}
                      error={!!accountErrors.email}
                      helperText={accountErrors.email?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Password"
                      type="password"
                      {...registerAccount('password')}
                      error={!!accountErrors.password}
                      helperText={accountErrors.password?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Confirm Password"
                      type="password"
                      {...registerAccount('confirmPassword')}
                      error={!!accountErrors.confirmPassword}
                      helperText={accountErrors.confirmPassword?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0.75,
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          '&:hover fieldset': {
                            borderColor: '#475569',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                            borderWidth: '1px',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#94a3b8',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3b82f6',
                        },
                        '& .MuiInputBase-input': {
                          color: '#f8fafc',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        borderRadius: 0.75,
                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        By registering, you agree to our Terms of Service and Privacy Policy
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2.5, gap: 1 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 90,
                  borderRadius: 0.75,
                  fontWeight: 600,
                  borderColor: '#475569',
                  color: '#e2e8f0',
                  fontSize: '0.875rem',
                  py: 0.75,
                  '&:hover': {
                    borderColor: '#64748b',
                    backgroundColor: 'rgba(71, 85, 105, 0.1)',
                  },
                  '&.Mui-disabled': {
                    borderColor: '#334155',
                    color: '#475569',
                  },
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={onFinalSubmit}
                  disabled={loading}
                  size="small"
                  endIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    minWidth: 140,
                    borderRadius: 0.75,
                    fontWeight: 600,
                    backgroundColor: '#3b82f6',
                    fontSize: '0.875rem',
                    py: 0.75,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#475569',
                      color: '#94a3b8',
                    },
                  }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  size="small"
                  sx={{
                    minWidth: 100,
                    borderRadius: 0.75,
                    fontWeight: 600,
                    backgroundColor: '#3b82f6',
                    fontSize: '0.875rem',
                    py: 0.75,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  Continue
                </Button>
              )}
            </Box>

            {/* Sign In Link */}
            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: '#334155' }}>
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
