import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import { updateCompany, uploadLogo, deleteLogo } from '../redux/slices/companySlice'

const API_BASE_URL = import.meta.env.VITE_API_URL;
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_URL;

const schema = yup.object({
  name: yup.string().required('Company name is required'),
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
})

export default function CompanyProfile() {
  const [editMode, setEditMode] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoLoading, setLogoLoading] = useState(false)
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { company, loading, error } = useSelector((state) => state.company)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (!company) return;

    reset(company);

    if (company.logo) {
      setLogoPreview(`${ASSET_BASE_URL}${company.logo}`);
    } else {
      setLogoPreview('');
    }
  }, [company, reset]);

  const handleEditToggle = () => {
    if (editMode && isDirty) {
      handleSubmit(onSubmit)()
    }
    setEditMode(!editMode)
  }

  const onSubmit = async (data) => {
    try {
      await dispatch(updateCompany(data)).unwrap()
      enqueueSnackbar('Company profile updated successfully!', { variant: 'success' })
      setEditMode(false)
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' })
    }
  }

  const handleLogoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('File size should be less than 5MB', { variant: 'error' })
        return
      }

      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Please select an image file', { variant: 'error' })
        return
      }

      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) {
      enqueueSnackbar('Please select a logo file', { variant: 'error' })
      return
    }

    setLogoLoading(true)
    const formData = new FormData()
    formData.append('logo', logoFile)

    try {
      await dispatch(uploadLogo(formData)).unwrap()
      enqueueSnackbar('Logo uploaded successfully!', { variant: 'success' })
      setLogoFile(null)
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to upload logo', { variant: 'error' })
      if (company?.logo) {
        setLogoPreview(`${ASSET_BASE_URL}${company.logo}`);
      } else {
        setLogoPreview('')
      }
    } finally {
      setLogoLoading(false)
    }
  }

  const handleLogoDelete = async () => {
    setLogoLoading(true)
    try {
      await dispatch(deleteLogo()).unwrap()
      setLogoPreview('')
      enqueueSnackbar('Logo removed successfully!', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to remove logo', { variant: 'error' })
    } finally {
      setLogoLoading(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="500"
            sx={{ 
              color: '#f1f5f9',
              mb: 0.5,
              letterSpacing: '-0.025em'
            }}
          >
            Company Profile
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}
          >
            Manage your company information for GST invoices
          </Typography>
        </Box>
        <Button
          variant={editMode ? 'contained' : 'outlined'}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={handleEditToggle}
          disabled={loading || logoLoading}
          sx={{
            borderRadius: '8px',
            fontWeight: 500,
            px: 3,
            py: 1,
            minHeight: 40,
            fontSize: '0.875rem',
            '&.MuiButton-contained': {
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              '&.Mui-disabled': {
                backgroundColor: '#334155',
                color: '#64748b'
              }
            },
            '&.MuiButton-outlined': {
              borderColor: '#475569',
              color: '#e2e8f0',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(255, 255, 255, 0.04)'
              },
              '&.Mui-disabled': {
                borderColor: '#334155',
                color: '#64748b'
              }
            }
          }}
        >
          {editMode ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error"
          sx={{ 
            mb: 3,
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-icon': {
              color: '#f87171'
            }
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Logo Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            height: '100%',
            transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: '#475569'
            }
          }}>
            <Typography 
              variant="h6" 
              fontWeight="500" 
              gutterBottom
              sx={{ 
                color: '#f1f5f9',
                mb: 1
              }}
            >
              Company Logo
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#94a3b8',
                mb: 3,
                fontSize: '0.875rem'
              }}
            >
              This logo will appear on all your invoices
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar
                src={logoPreview}
                sx={{
                  width: 160,
                  height: 160,
                  mb: 3,
                  bgcolor: '#0f172a',
                  color: '#94a3b8',
                  fontSize: 48,
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {!logoPreview && <BusinessIcon sx={{ fontSize: 64 }} />}
              </Avatar>

              {logoLoading && (
                <Box sx={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  mb: 2,
                  p: 2,
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.1)'
                }}>
                  <CircularProgress size={20} sx={{ color: '#3b82f6' }} />
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1, fontSize: '0.75rem' }}>
                    Processing...
                  </Typography>
                </Box>
              )}

              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoChange}
                disabled={logoLoading}
              />
              <label htmlFor="logo-upload" style={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ 
                    mb: 1,
                    borderRadius: '8px',
                    borderColor: '#475569',
                    color: '#e2e8f0',
                    backgroundColor: '#1e293b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    minHeight: 40,
                    '&:hover': {
                      borderColor: '#64748b',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)'
                    },
                    '&.Mui-disabled': {
                      borderColor: '#334155',
                      color: '#64748b'
                    }
                  }}
                  disabled={logoLoading}
                >
                  Choose Logo
                </Button>
              </label>

              {logoFile && !logoLoading && (
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={handleLogoUpload}
                    fullWidth
                    sx={{ 
                      mb: 1,
                      borderRadius: '8px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      minHeight: 40,
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#334155',
                        color: '#64748b'
                      }
                    }}
                    disabled={logoLoading}
                  >
                    Upload Logo
                  </Button>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#94a3b8', 
                      textAlign: 'center', 
                      display: 'block',
                      fontSize: '0.75rem'
                    }}
                  >
                    Selected: {logoFile.name}
                  </Typography>
                </Box>
              )}

              {logoPreview && company?.logo && !logoLoading && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleLogoDelete}
                  fullWidth
                  sx={{ 
                    mt: 2,
                    borderRadius: '8px',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    minHeight: 40,
                    '&:hover': {
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    },
                    '&.Mui-disabled': {
                      borderColor: '#334155',
                      color: '#64748b'
                    }
                  }}
                  disabled={logoLoading}
                >
                  Remove Logo
                </Button>
              )}

              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  textAlign: 'center', 
                  mt: 3,
                  display: 'block',
                  fontSize: '0.75rem'
                }}
              >
                Recommended: Square image, max 5MB
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Company Info Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: '#475569'
            }
          }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Company Information Header */}
                <Grid item xs={12}>
                  <Typography 
                    variant="h6" 
                    fontWeight="500" 
                    gutterBottom
                    sx={{ 
                      color: '#f1f5f9'
                    }}
                  >
                    Company Information
                  </Typography>
                </Grid>

                {/* Company Name */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.name ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* GST Number */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GST Number *"
                    placeholder="27AABCD1234A1Z5"
                    {...register('gstNumber')}
                    error={!!errors.gstNumber}
                    helperText={errors.gstNumber?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.gstNumber ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* Business Address Header */}
                <Grid item xs={12}>
                  <Divider sx={{ 
                    my: 3,
                    borderColor: '#334155'
                  }} />
                  <Typography 
                    variant="h6" 
                    fontWeight="500" 
                    gutterBottom
                    sx={{ 
                      color: '#f1f5f9'
                    }}
                  >
                    Business Address
                  </Typography>
                </Grid>

                {/* Street Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address *"
                    {...register('address.street')}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.address?.street ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* City & State */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City *"
                    {...register('address.city')}
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.address?.city ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State *"
                    {...register('address.state')}
                    error={!!errors.address?.state}
                    helperText={errors.address?.state?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.address?.state ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* Pincode */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pincode *"
                    {...register('address.pincode')}
                    error={!!errors.address?.pincode}
                    helperText={errors.address?.pincode?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.address?.pincode ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* Contact Information Header */}
                <Grid item xs={12}>
                  <Divider sx={{ 
                    my: 3,
                    borderColor: '#334155'
                  }} />
                  <Typography 
                    variant="h6" 
                    fontWeight="500" 
                    gutterBottom
                    sx={{ 
                      color: '#f1f5f9'
                    }}
                  >
                    Contact Information
                  </Typography>
                </Grid>

                {/* Email & Phone */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    type="email"
                    {...register('contact.email')}
                    error={!!errors.contact?.email}
                    helperText={errors.contact?.email?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.contact?.email ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...register('contact.phone')}
                    error={!!errors.contact?.phone}
                    helperText={errors.contact?.phone?.message}
                    disabled={!editMode}
                    size="small"
                    InputLabelProps={{
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-disabled': {
                          color: '#94a3b8',
                          backgroundColor: '#1e293b'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.contact?.phone ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>

                {/* Action Buttons */}
                {editMode && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: 'flex-end',
                      pt: 3,
                      borderTop: '1px solid #334155'
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(false)
                          reset(company)
                          if (company?.logo) {
                            setLogoPreview(`${ASSET_BASE_URL}${company.logo}`);
                          }
                        }}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 500,
                          borderColor: '#475569',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                          minHeight: 40,
                          px: 3,
                          '&:hover': {
                            borderColor: '#64748b',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !isDirty}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 500,
                          px: 3,
                          minHeight: 40,
                          fontSize: '0.875rem',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#2563eb',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#334155',
                            color: '#64748b'
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}