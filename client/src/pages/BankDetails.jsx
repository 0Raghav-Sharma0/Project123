import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { getBankDetails, updateBankDetails, clearBankError } from '../redux/slices/bankSlice';

const schema = yup.object({
  bankName: yup.string().required('Bank name is required'),
  branchName: yup.string().required('Branch name is required'),
  accountNumber: yup
    .string()
    .matches(/^[0-9]{9,18}$/, 'Account number must be 9-18 digits')
    .required('Account number is required'),
  ifscCode: yup
    .string()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format')
    .required('IFSC code is required'),
  accountHolderName: yup.string().required('Account holder name is required'),
  accountType: yup.string().oneOf(['savings', 'current']).default('savings'),
  upiId: yup.string().optional().matches(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format'),
});

export default function BankDetails() {
  const [editMode, setEditMode] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { bank, loading, error } = useSelector((state) => state.bank);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      accountType: 'savings',
      upiId: '',
    }
  });

  useEffect(() => {
    dispatch(getBankDetails());
  }, [dispatch]);

  useEffect(() => {
    if (bank) {
      reset({
        bankName: bank.bankName || '',
        branchName: bank.branchName || '',
        accountNumber: bank.accountNumber || '',
        ifscCode: bank.ifscCode || '',
        accountHolderName: bank.accountHolderName || '',
        accountType: bank.accountType || 'savings',
        upiId: bank.upiId || '',
      });
    }
  }, [bank, reset]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      setTimeout(() => dispatch(clearBankError()), 3000);
    }
  }, [error, enqueueSnackbar, dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateBankDetails(data)).unwrap();
      enqueueSnackbar('Bank details updated', { 
        variant: 'success',
      });
      setEditMode(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (bank) {
      reset({
        bankName: bank.bankName || '',
        branchName: bank.branchName || '',
        accountNumber: bank.accountNumber || '',
        ifscCode: bank.ifscCode || '',
        accountHolderName: bank.accountHolderName || '',
        accountType: bank.accountType || 'savings',
        upiId: bank.upiId || '',
      });
    }
  };

  const formatAccountNumber = (accNum) => {
    if (!accNum) return '';
    return `****${accNum.slice(-4)}`;
  };

  if (loading && !bank) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress size={24} sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
      }}>
        <Box>
          <Typography 
            variant="h5" 
            fontWeight={600}
            sx={{ 
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            Bank Details
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
            }}
          >
            Banking information for your invoices
          </Typography>
        </Box>
        
        {!editMode && bank && (bank.bankName || bank.accountHolderName) && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
            sx={{
              fontWeight: 500,
              px: 3,
              py: 1,
            }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: 1,
          }}>
            {editMode ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ 
                    mb: 3
                  }}
                >
                  Edit Bank Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      {...register('bankName')}
                      error={!!errors.bankName}
                      helperText={errors.bankName?.message}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Branch Name"
                      {...register('branchName')}
                      error={!!errors.branchName}
                      helperText={errors.branchName?.message}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      {...register('accountNumber')}
                      error={!!errors.accountNumber}
                      helperText={errors.accountNumber?.message}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      {...register('ifscCode')}
                      error={!!errors.ifscCode}
                      helperText={errors.ifscCode?.message}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Holder"
                      {...register('accountHolderName')}
                      error={!!errors.accountHolderName}
                      helperText={errors.accountHolderName?.message}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" error={!!errors.accountType}>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        label="Account Type"
                        {...register('accountType')}
                        defaultValue="savings"
                        disabled={loading}
                      >
                        <MenuItem value="savings">Savings Account</MenuItem>
                        <MenuItem value="current">Current Account</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="UPI ID (Optional)"
                      {...register('upiId')}
                      error={!!errors.upiId}
                      helperText={errors.upiId?.message || "Example: username@upi"}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: 'flex-end',
                    }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={loading}
                        startIcon={<ArrowBackIcon />}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !isDirty || !isValid}
                      >
                        {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ 
                    mb: 3
                  }}
                >
                  Bank Information
                </Typography>
                
                {bank && (bank.bankName || bank.accountHolderName) ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Bank Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {bank.bankName || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Branch
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {bank.branchName || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Account Number
                        </Typography>
                        <Typography variant="body1" fontWeight={500} sx={{ color: 'text.secondary' }}>
                          {formatAccountNumber(bank.accountNumber) || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          IFSC Code
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {bank.ifscCode || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Account Holder
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {bank.accountHolderName || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Account Type
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {bank.accountType === 'savings' ? 'Savings Account' : 
                           bank.accountType === 'current' ? 'Current Account' : '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {bank.upiId && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 3 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            UPI ID
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {bank.upiId}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert 
                    severity="info"
                    sx={{ 
                      borderRadius: 1,
                    }}
                  >
                    <Typography fontWeight={600} sx={{ mb: 1 }}>
                      No bank details found
                    </Typography>
                    <Typography variant="body2">
                      Add your bank information to include it on invoices.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Bank Details
                    </Button>
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar with Tips */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: 1,
          }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              gutterBottom
              sx={{ 
                mb: 3
              }}
            >
              Important Notes
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" paragraph sx={{ 
                mb: 2,
                fontSize: '0.875rem',
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Bank details accuracy:</Box> Ensure all information matches your official bank records for GST compliance.
              </Typography>
              
              <Typography variant="body2" paragraph sx={{ 
                mb: 2,
                fontSize: '0.875rem',
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Name verification:</Box> Account holder name must exactly match your GST registration.
              </Typography>
              
              <Typography variant="body2" paragraph sx={{ 
                mb: 2,
                fontSize: '0.875rem',
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>IFSC format:</Box> 11 characters, uppercase letters and numbers (e.g., SBIN0000123).
              </Typography>
              
              <Typography variant="body2" sx={{ 
                fontSize: '0.875rem',
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Security:</Box> Account numbers are masked for protection in the interface.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontStyle: 'italic'
            }}>
              Contact support if you need assistance updating your bank details.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}