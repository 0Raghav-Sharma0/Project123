import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Divider,
  InputAdornment,
  FormControl,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material'
import { useForm, useFieldArray } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import { createInvoice, updateInvoice } from '../redux/slices/invoiceSlice'
import { calculateGST } from '../utils/gstCalculator'
import { generatePDF } from '../services/pdfGenerator'

const GST_RATES = [0, 5, 12, 18, 28]

export default function GenerateInvoice({ editMode = false, invoiceId }) {
  const [loading, setLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [cgstTotal, setCgstTotal] = useState(0)
  const [sgstTotal, setSgstTotal] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [roundOff, setRoundOff] = useState(0)
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { currentInvoice } = useSelector((state) => state.invoices)
  const { company } = useSelector((state) => state.company)
  const { bank } = useSelector((state) => state.bank)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customer: {
        name: '',
        gstin: '',
        email: '',
        phone: '',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
        },
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          pincode: '',
        },
      },
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      products: [
        {
          description: '',
          hsnCode: '',
          quantity: 1,
          unit: 'Nos',
          price: 0,
          gstRate: parseInt(import.meta.env.VITE_DEFAULT_GST_RATE) || 18,
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          totalAmount: 0,
        },
      ],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  const products = watch('products')

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0
    return num.toFixed(2)
  }

  useEffect(() => {
    if (editMode && currentInvoice) {
      const formattedInvoice = {
        ...currentInvoice,
        invoiceDate: formatDateForInput(currentInvoice.invoiceDate),
        dueDate: formatDateForInput(currentInvoice.dueDate)
      }
      reset(formattedInvoice)
      calculateTotals(currentInvoice.products)
    }
  }, [editMode, currentInvoice, reset])

  useEffect(() => {
    calculateTotals(products)
  }, [products])

  const formatDateForInput = (date) => {
    if (!date) return new Date().toISOString().split('T')[0]
    
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]
    }
    
    if (typeof date === 'string') {
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0]
      }
    }
    
    return new Date().toISOString().split('T')[0]
  }

  const calculateTotals = (products) => {
    let subtotal = 0
    let cgstTotal = 0
    let sgstTotal = 0

    products.forEach((product) => {
      const quantity = parseFloat(product?.quantity) || 0
      const price = parseFloat(product?.price) || 0
      const gstRate = parseFloat(product?.gstRate) || 0

      const taxableValue = quantity * price
      const gstAmount = taxableValue * (gstRate / 100)
      const cgstAmount = gstAmount / 2
      const sgstAmount = gstAmount / 2

      subtotal += taxableValue
      cgstTotal += cgstAmount
      sgstTotal += sgstAmount
    })

    const total = subtotal + cgstTotal + sgstTotal
    const roundOff = Math.round(total) - total
    const netPayable = Math.round(total)

    setSubtotal(parseFloat(subtotal.toFixed(2)))
    setCgstTotal(parseFloat(cgstTotal.toFixed(2)))
    setSgstTotal(parseFloat(sgstTotal.toFixed(2)))
    setGrandTotal(parseFloat(netPayable.toFixed(2)))
    setRoundOff(parseFloat(roundOff.toFixed(2)))
  }

  const updateProductCalculation = (index) => {
    const product = products[index]
    const quantity = parseFloat(product?.quantity) || 0
    const price = parseFloat(product?.price) || 0
    const gstRate = parseFloat(product?.gstRate) || 0

    const { taxableValue, cgstAmount, sgstAmount, totalAmount } = calculateGST(
      quantity,
      price,
      gstRate
    )

    setValue(`products.${index}.taxableValue`, taxableValue)
    setValue(`products.${index}.cgstAmount`, cgstAmount)
    setValue(`products.${index}.sgstAmount`, sgstAmount)
    setValue(`products.${index}.totalAmount`, totalAmount)
  }

  const handleProductChange = (index, field, value) => {
    setValue(`products.${index}.${field}`, value)
    updateProductCalculation(index)
  }

  const addProduct = () => {
    append({
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'Nos',
      price: 0,
      gstRate: parseInt(import.meta.env.VITE_DEFAULT_GST_RATE) || 18,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0,
    })
  }

  const removeProduct = (index) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const validateForm = (data) => {
    const errors = []
    
    if (!data.customer.name?.trim()) {
      errors.push('Customer name is required')
    }
    
    if (!data.customer.billingAddress?.street?.trim()) {
      errors.push('Billing street address is required')
    }
    
    if (!data.customer.billingAddress?.city?.trim()) {
      errors.push('Billing city is required')
    }
    
    if (!data.customer.billingAddress?.state?.trim()) {
      errors.push('Billing state is required')
    }
    
    if (!data.customer.billingAddress?.pincode?.trim()) {
      errors.push('Billing pincode is required')
    }
    
    if (!data.products || data.products.length === 0) {
      errors.push('At least one product is required')
    } else {
      data.products.forEach((product, index) => {
        if (!product.description?.trim()) {
          errors.push(`Product ${index + 1}: Description is required`)
        }
        
        const quantity = parseFloat(product.quantity)
        if (isNaN(quantity) || quantity <= 0) {
          errors.push(`Product ${index + 1}: Quantity must be greater than 0`)
        }
        
        const price = parseFloat(product.price)
        if (isNaN(price) || price <= 0) {
          errors.push(`Product ${index + 1}: Price must be greater than 0`)
        }
      })
    }
    
    return errors
  }

  const onSubmit = async (data) => {
    const validationErrors = validateForm(data)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        enqueueSnackbar(error, { variant: 'error' })
      })
      return
    }
    
    setLoading(true)
    try {
      const invoiceData = {
        customer: {
          name: data.customer.name?.trim() || '',
          gstin: data.customer.gstin?.trim() || '',
          email: data.customer.email?.trim() || '',
          phone: data.customer.phone?.trim() || '',
          billingAddress: {
            street: data.customer.billingAddress.street?.trim() || '',
            city: data.customer.billingAddress.city?.trim() || '',
            state: data.customer.billingAddress.state?.trim() || '',
            pincode: data.customer.billingAddress.pincode?.trim() || '',
          },
          shippingAddress: {
            street: data.customer.shippingAddress?.street?.trim() || '',
            city: data.customer.shippingAddress?.city?.trim() || '',
            state: data.customer.shippingAddress?.state?.trim() || '',
            pincode: data.customer.shippingAddress?.pincode?.trim() || '',
          }
        },
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        paymentTerms: data.paymentTerms,
        notes: data.notes || '',
        products: data.products.map(product => ({
          description: product.description?.trim() || '',
          hsnCode: product.hsnCode?.trim() || '',
          quantity: parseFloat(product.quantity) || 1,
          unit: product.unit?.trim() || 'Nos',
          price: parseFloat(product.price) || 0,
          gstRate: parseFloat(product.gstRate) || 0
        })),
        status: 'generated'
      }

      if (editMode) {
        await dispatch(updateInvoice({ id: invoiceId, data: invoiceData })).unwrap()
        enqueueSnackbar('Invoice updated successfully!', { variant: 'success' })
      } else {
        await dispatch(createInvoice(invoiceData)).unwrap()
        enqueueSnackbar('Invoice created successfully!', { variant: 'success' })
        reset()
      }
    } catch (error) {
      if (error.includes('Validation failed')) {
        enqueueSnackbar('Please check all required fields are filled correctly', { variant: 'error' })
      } else if (error.includes('Company not found')) {
        enqueueSnackbar('Please setup your company details first', { variant: 'error' })
      } else {
        enqueueSnackbar(error || 'Failed to save invoice', { variant: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    setTimeout(() => {
      generatePDF('invoice-pdf', 'gst-invoice.pdf')
      enqueueSnackbar('Generating PDF...', { variant: 'info' })
    }, 100)
  }

  const copyBillingToShipping = () => {
    const billing = watch('customer.billingAddress')
    setValue('customer.shippingAddress', { ...billing })
    enqueueSnackbar('Shipping address copied from billing address', { variant: 'info' })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
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
            {editMode ? 'Edit Invoice' : 'Create GST Invoice'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#94a3b8',
              fontSize: '0.875rem'
            }}
          >
            {editMode 
              ? `Editing: ${currentInvoice?.invoiceNumber || ''}` 
              : 'Create GST-compliant invoices'
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{
              borderRadius: '8px',
              borderColor: '#475569',
              color: '#e2e8f0',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 40,
              px: 3,
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(255, 255, 255, 0.04)'
              }
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <SaveIcon />}
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              px: 3,
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 40,
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
            {loading ? 'Saving...' : editMode ? 'Update Invoice' : 'Save Invoice'}
          </Button>
        </Box>
      </Box>

      {/* PDF Content Container - Separate for PDF generation */}
      <Box
        id="invoice-pdf"
        sx={{
          backgroundColor: '#ffffff',
          color: '#000000',
          p: 0,
          m: 0,
          '& .MuiPaper-root': {
            backgroundColor: '#ffffff',
            color: '#000000',
            boxShadow: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
          },
          '& .MuiTypography-root': {
            color: '#000000',
          },
          '& .MuiTableCell-root': {
            color: '#000000',
            borderColor: '#e5e7eb',
            backgroundColor: '#ffffff',
          },
          '& .MuiInputBase-root': {
            color: '#000000',
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e5e7eb',
            }
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
          },
          '& .pdf-hide': {
            display: 'none !important',
          },
          '& button': {
            display: 'none',
          },
          '& .MuiButton-root': {
            display: 'none',
          },
          '& .MuiIconButton-root': {
            display: 'none',
          }
        }}
        style={{
          display: 'none',
          position: 'fixed',
          left: '-9999px',
          top: '-9999px'
        }}
      >
        {/* PDF-only invoice content */}
        <Box sx={{ p: 3 }}>
          {/* Company Header for PDF */}
          <Box sx={{ mb: 4, borderBottom: '2px solid #3b82f6', pb: 2 }}>
            <Typography variant="h4" fontWeight="600" sx={{ color: '#1e40af', mb: 1 }}>
              {company?.name || 'Your Company Name'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              {company?.address?.street || 'Street Address'}, {company?.address?.city || 'City'}, 
              {company?.address?.state || 'State'} - {company?.address?.pincode || 'PIN'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              GSTIN: {company?.gstin || 'GSTIN Number'} | Phone: {company?.phone || 'Phone'}
            </Typography>
          </Box>

          {/* Invoice Details Header */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={8}>
              <Typography variant="h5" fontWeight="600" sx={{ color: '#111827', mb: 2 }}>
                TAX INVOICE
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                <strong>Bill To:</strong> {watch('customer.name') || 'Customer Name'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                {watch('customer.billingAddress.street') || 'Street'}, 
                {watch('customer.billingAddress.city') || 'City'}, 
                {watch('customer.billingAddress.state') || 'State'} - 
                {watch('customer.billingAddress.pincode') || 'PIN'}
              </Typography>
              {watch('customer.gstin') && (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  GSTIN: {watch('customer.gstin')}
                </Typography>
              )}
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ 
                border: '1px solid #e5e7eb', 
                p: 2, 
                borderRadius: '4px',
                backgroundColor: '#f9fafb'
              }}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  <strong>Invoice No:</strong> {currentInvoice?.invoiceNumber || 'INV-001'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  <strong>Date:</strong> {watch('invoiceDate') || new Date().toISOString().split('T')[0]}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  <strong>Due Date:</strong> {watch('dueDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Products Table for PDF */}
          <TableContainer sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }}>HSN/SAC</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">GST %</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">Taxable Value</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">CGST</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">SGST</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '12px', py: 1 }} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell sx={{ py: 1 }}>{watch(`products.${index}.description`) || 'Product/Service'}</TableCell>
                    <TableCell sx={{ py: 1 }}>{watch(`products.${index}.hsnCode`) || '-'}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">{watch(`products.${index}.quantity`) || 1}</TableCell>
                    <TableCell sx={{ py: 1 }}>{watch(`products.${index}.unit`) || 'Nos'}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">₹{formatCurrency(watch(`products.${index}.price`))}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">{watch(`products.${index}.gstRate`) || 18}%</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">₹{formatCurrency(watch(`products.${index}.taxableValue`))}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">₹{formatCurrency(watch(`products.${index}.cgstAmount`))}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">₹{formatCurrency(watch(`products.${index}.sgstAmount`))}</TableCell>
                    <TableCell sx={{ py: 1 }} align="right">₹{formatCurrency(watch(`products.${index}.totalAmount`))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary for PDF */}
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={4}>
              <Box sx={{ border: '1px solid #e5e7eb', p: 2, borderRadius: '4px' }}>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>CGST:</span>
                  <span>₹{cgstTotal.toFixed(2)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>SGST:</span>
                  <span>₹{sgstTotal.toFixed(2)}</span>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <span>Round Off:</span>
                  <span>₹{roundOff.toFixed(2)}</span>
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: '#f0f9ff',
                  p: 1.5,
                  borderRadius: '4px',
                  border: '1px solid #bae6fd',
                  mt: 2
                }}>
                  <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600 }}>Net Payable:</Typography>
                  <Typography variant="h5" sx={{ fontSize: '16px', fontWeight: 700, color: '#0369a1' }}>
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Notes for PDF */}
          {watch('notes') && (
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Notes:</Typography>
              <Typography variant="body2" sx={{ color: '#4b5563' }}>{watch('notes')}</Typography>
            </Box>
          )}

          {/* Footer for PDF */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Bank Details:</Typography>
                <Typography variant="body2" sx={{ fontSize: '11px', color: '#6b7280' }}>
                  {bank?.bankName || 'Bank Name'}<br />
                  A/C No: {bank?.accountNumber || 'Account Number'}<br />
                  IFSC: {bank?.ifscCode || 'IFSC Code'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Terms:</Typography>
                <Typography variant="body2" sx={{ fontSize: '11px', color: '#6b7280' }}>
                  {watch('paymentTerms') || 'Net 30'} Days<br />
                  Subject to {company?.address?.city || 'City'} Jurisdiction
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 3 }}>Authorized Signatory</Typography>
                  <Typography variant="body2" sx={{ fontSize: '11px', color: '#6b7280' }}>
                    For {company?.name || 'Your Company Name'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Main UI Content (visible on screen) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Customer Details */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155'
            }}>
              <Typography 
                variant="h6" 
                fontWeight="500" 
                gutterBottom
                sx={{ 
                  color: '#f1f5f9',
                  mb: 3,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Customer Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Customer Name *"
                    {...register('customer.name', { 
                      required: 'Customer name is required',
                      validate: value => value?.trim() ? true : 'Customer name is required'
                    })}
                    error={!!errors.customer?.name}
                    helperText={errors.customer?.name?.message}
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
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.customer?.name ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GSTIN"
                    {...register('customer.gstin')}
                    placeholder="27AAAAA0000A1Z5"
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
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('customer.email')}
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
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    {...register('customer.phone')}
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
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Address Details */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155'
            }}>
              <Typography 
                variant="h6" 
                fontWeight="500" 
                gutterBottom
                sx={{ 
                  color: '#f1f5f9',
                  mb: 3,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Address Details
              </Typography>
              <Grid container spacing={3}>
                {/* Billing Address */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{ 
                        color: '#f1f5f9'
                      }}
                    >
                      Billing Address *
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address *"
                        {...register('customer.billingAddress.street', { 
                          required: 'Street address is required',
                          validate: value => value?.trim() ? true : 'Street address is required'
                        })}
                        error={!!errors.customer?.billingAddress?.street}
                        helperText={errors.customer?.billingAddress?.street?.message}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: errors.customer?.billingAddress?.street ? '#f87171' : '#94a3b8'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="City *"
                        {...register('customer.billingAddress.city', { 
                          required: 'City is required',
                          validate: value => value?.trim() ? true : 'City is required'
                        })}
                        error={!!errors.customer?.billingAddress?.city}
                        helperText={errors.customer?.billingAddress?.city?.message}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: errors.customer?.billingAddress?.city ? '#f87171' : '#94a3b8'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State *"
                        {...register('customer.billingAddress.state', { 
                          required: 'State is required',
                          validate: value => value?.trim() ? true : 'State is required'
                        })}
                        error={!!errors.customer?.billingAddress?.state}
                        helperText={errors.customer?.billingAddress?.state?.message}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: errors.customer?.billingAddress?.state ? '#f87171' : '#94a3b8'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Pincode *"
                        {...register('customer.billingAddress.pincode', { 
                          required: 'Pincode is required',
                          validate: value => value?.trim() ? true : 'Pincode is required',
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Pincode must be 6 digits'
                          }
                        })}
                        error={!!errors.customer?.billingAddress?.pincode}
                        helperText={errors.customer?.billingAddress?.pincode?.message}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                        FormHelperTextProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: errors.customer?.billingAddress?.pincode ? '#f87171' : '#94a3b8'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Shipping Address */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{ 
                        color: '#f1f5f9'
                      }}
                    >
                      Shipping Address
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={copyBillingToShipping}
                      sx={{
                        color: '#94a3b8',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        '&:hover': {
                          color: '#60a5fa',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      Copy from Billing
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        {...register('customer.shippingAddress.street')}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="City"
                        {...register('customer.shippingAddress.city')}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State"
                        {...register('customer.shippingAddress.state')}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        {...register('customer.shippingAddress.pincode')}
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
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Invoice Details */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155'
            }}>
              <Typography 
                variant="h6" 
                fontWeight="500" 
                gutterBottom
                sx={{ 
                  color: '#f1f5f9',
                  mb: 3,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Invoice Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Invoice Date *"
                    type="date"
                    {...register('invoiceDate', { required: 'Invoice date is required' })}
                    error={!!errors.invoiceDate}
                    helperText={errors.invoiceDate?.message}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    size="small"
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.invoiceDate ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Due Date *"
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    error={!!errors.dueDate}
                    helperText={errors.dueDate?.message}
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        color: '#94a3b8',
                        '&.Mui-focused': {
                          color: '#3b82f6'
                        }
                      }
                    }}
                    size="small"
                    InputProps={{
                      sx: {
                        color: '#f1f5f9',
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '0.75rem',
                        color: errors.dueDate ? '#f87171' : '#94a3b8'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Payment Terms"
                    {...register('paymentTerms')}
                    select
                    defaultValue="Net 30"
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
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px'
                        }
                      }
                    }}
                  >
                    <MenuItem value="Net 15">Net 15</MenuItem>
                    <MenuItem value="Net 30">Net 30</MenuItem>
                    <MenuItem value="Net 45">Net 45</MenuItem>
                    <MenuItem value="Net 60">Net 60</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Products Table */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="500"
                  sx={{ 
                    color: '#f1f5f9',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Products / Services *
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addProduct}
                  sx={{
                    borderRadius: '8px',
                    borderColor: '#475569',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minHeight: 40,
                    px: 3,
                    '&:hover': {
                      borderColor: '#64748b',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)'
                    }
                  }}
                >
                  Add Product
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: '#0f172a'
                    }}>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }}>
                        Description *
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }}>
                        HSN/SAC
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        Qty *
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5,
                        width: 80
                      }}>
                        Unit
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        Price *
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5,
                        width: 100
                      }} align="right">
                        GST %
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        Taxable
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        CGST
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        SGST
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        borderBottom: '1px solid #334155',
                        py: 1.5
                      }} align="right">
                        Total
                      </TableCell>
                      <TableCell sx={{ 
                        borderBottom: '1px solid #334155',
                        py: 1.5,
                        width: 48
                      }} align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow 
                        key={field.id}
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.02)'
                          },
                          borderBottom: '1px solid #334155'
                        }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <TextField
                            fullWidth
                            size="small"
                            {...register(`products.${index}.description`, {
                              required: 'Description is required',
                              validate: value => value?.trim() ? true : 'Description is required'
                            })}
                            placeholder="Product/Service description"
                            error={!!errors.products?.[index]?.description}
                            helperText={errors.products?.[index]?.description?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#0f172a',
                                fontSize: '0.875rem',
                                '&.Mui-focused fieldset': {
                                  borderColor: '#3b82f6'
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <TextField
                            fullWidth
                            size="small"
                            {...register(`products.${index}.hsnCode`)}
                            placeholder="HSN/SAC code"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#0f172a',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            type="number"
                            {...register(`products.${index}.quantity`, { 
                              required: 'Quantity is required',
                              min: { value: 0.01, message: 'Minimum 0.01' },
                              value: 1
                            })}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            sx={{ width: 80 }}
                            error={!!errors.products?.[index]?.quantity}
                            helperText={errors.products?.[index]?.quantity?.message}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            {...register(`products.${index}.unit`)}
                            sx={{ width: 80 }}
                            defaultValue="Nos"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            type="number"
                            {...register(`products.${index}.price`, { 
                              required: 'Price is required',
                              min: { value: 0, message: 'Minimum 0' },
                              value: 0
                            })}
                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                            sx={{ width: 100 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">₹</InputAdornment>
                              ),
                            }}
                            error={!!errors.products?.[index]?.price}
                            helperText={errors.products?.[index]?.price?.message}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <FormControl size="small" sx={{ width: 100 }}>
                            <Select
                              value={watch(`products.${index}.gstRate`) || 18}
                              onChange={(e) => handleProductChange(index, 'gstRate', e.target.value)}
                              sx={{
                                borderRadius: '8px',
                                backgroundColor: '#0f172a',
                                fontSize: '0.875rem'
                              }}
                            >
                              {GST_RATES.map((rate) => (
                                <MenuItem key={rate} value={rate}>
                                  {rate}%
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            value={formatCurrency(watch(`products.${index}.taxableValue`))}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">₹</InputAdornment>
                              ),
                            }}
                            sx={{ width: 120, backgroundColor: '#0f172a' }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            value={formatCurrency(watch(`products.${index}.cgstAmount`))}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">₹</InputAdornment>
                              ),
                            }}
                            sx={{ width: 120, backgroundColor: '#0f172a' }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            value={formatCurrency(watch(`products.${index}.sgstAmount`))}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">₹</InputAdornment>
                              ),
                            }}
                            sx={{ width: 120, backgroundColor: '#0f172a' }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <TextField
                            size="small"
                            value={formatCurrency(watch(`products.${index}.totalAmount`))}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">₹</InputAdornment>
                              ),
                            }}
                            sx={{ width: 120, backgroundColor: '#0f172a' }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <IconButton
                            onClick={() => removeProduct(index)}
                            disabled={fields.length === 1}
                            sx={{
                              color: '#94a3b8',
                              '&:hover': {
                                color: '#f87171',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)'
                              },
                              '&.Mui-disabled': {
                                color: '#475569'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155'
            }}>
              <Typography 
                variant="h6" 
                fontWeight="500" 
                gutterBottom
                sx={{ 
                  color: '#f1f5f9',
                  mb: 3,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add any additional notes or terms for this invoice..."
                {...register('notes')}
                defaultValue=""
                size="small"
                InputProps={{
                  sx: {
                    color: '#f1f5f9',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              position: 'sticky',
              top: 24
            }}>
              <Typography 
                variant="h6" 
                fontWeight="500" 
                gutterBottom
                sx={{ 
                  color: '#f1f5f9',
                  mb: 3
                }}
              >
                Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Subtotal:</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#f1f5f9' }}>
                    ₹{subtotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>CGST:</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#f1f5f9' }}>
                    ₹{cgstTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>SGST:</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#f1f5f9' }}>
                    ₹{sgstTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ 
                  my: 3,
                  borderColor: '#334155'
                }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Round Off:</Typography>
                  <Typography variant="body2" fontWeight="500" sx={{ color: '#94a3b8' }}>
                    ₹{roundOff.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: '#0f172a',
                  p: 2.5,
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <Typography variant="h6" sx={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 500 }}>Net Payable:</Typography>
                  <Typography variant="h5" fontWeight="600" sx={{ color: '#60a5fa' }}>
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}