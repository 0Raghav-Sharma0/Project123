import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import {
  Box,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'
import GenerateInvoice from './GenerateInvoice'
import { getInvoice, clearCurrentInvoice } from '../redux/slices/invoiceSlice'

export default function EditInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { currentInvoice, loading, error } = useSelector((state) => state.invoices)

  useEffect(() => {
    if (id) {
      dispatch(getInvoice(id))
    }

    return () => {
      dispatch(clearCurrentInvoice())
    }
  }, [id, dispatch])

  // Show loading spinner
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={32}
              thickness={4}
              sx={{
                color: '#3b82f6',
                mb: 3
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: '#f1f5f9',
                fontWeight: 500,
                mb: 1
              }}
            >
              Loading Invoice
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem'
              }}
            >
              Fetching invoice details...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    )
  }

  // Handle errors
  if (error) {
    useEffect(() => {
      enqueueSnackbar(error, { variant: 'error' })
      setTimeout(() => {
        navigate('/invoices')
      }, 1500)
    }, [error, enqueueSnackbar, navigate])

    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Typography sx={{ 
                color: '#f87171', 
                fontSize: 28, 
                fontWeight: 500 
              }}>
                !
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: '#f1f5f9',
                fontWeight: 500,
                mb: 1
              }}
            >
              Error Loading Invoice
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                mb: 4,
                fontSize: '0.875rem'
              }}
            >
              Redirecting to invoices...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    )
  }

  // Handle invoice not found
  if (!currentInvoice) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        p: 3
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ 
            textAlign: 'center',
            maxWidth: 480,
            p: 4,
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155'
          }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Typography sx={{ 
                color: '#60a5fa', 
                fontSize: 36,
                fontWeight: 500 
              }}>
                ?
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: '#f1f5f9',
                fontWeight: 500,
                mb: 2
              }}
            >
              Invoice Not Found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#94a3b8',
                mb: 4,
                lineHeight: 1.6,
                fontSize: '0.875rem'
              }}
            >
              The invoice you're trying to edit doesn't exist or you don't have permission to access it.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/invoices')}
              sx={{
                borderRadius: '8px',
                fontWeight: 500,
                px: 3,
                py: 1,
                minHeight: 40,
                fontSize: '0.875rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#2563eb',
                }
              }}
            >
              Back to Invoices
            </Button>
          </Box>
        </motion.div>
      </Box>
    )
  }

  // Render the GenerateInvoice component in edit mode
  return <GenerateInvoice editMode={true} invoiceId={id} />
}