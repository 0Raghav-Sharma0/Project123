import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Paid as PaidIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getDashboardStats, getInvoices } from '../redux/slices/invoiceSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);

  const { dashboardStats, invoices, loading: invoicesLoading } = useSelector((state) => state.invoices);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getDashboardStats()),
          dispatch(getInvoices({ limit: 10 }))
        ]);
      } catch (error) {
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, enqueueSnackbar]);

  const getStatusColor = (status) => {
    const colors = {
      'paid': {
        bg: 'rgba(16, 185, 129, 0.1)',
        text: '#34d399',
      },
      'overdue': {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#f87171',
      },
      'generated': {
        bg: 'rgba(59, 130, 246, 0.1)',
        text: '#60a5fa',
      },
      'sent': {
        bg: 'rgba(245, 158, 11, 0.1)',
        text: '#fbbf24',
      },
      'default': {
        bg: 'rgba(148, 163, 184, 0.1)',
        text: '#94a3b8',
      }
    };
    
    return colors[status] || colors.default;
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrencyWithDecimals = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleDownloadPDF = (invoice) => {
    navigate(`/invoice/${invoice._id}?download=true`);
  };

  // Safely get stats values with fallbacks
  const statsCards = [
    {
      title: 'Total Revenue',
      value: Number(dashboardStats?.totalAmount) || 0,
      icon: <MoneyIcon />,
      delay: 0.1,
      formattedValue: formatCurrency(dashboardStats?.totalAmount || 0)
    },
    {
      title: 'Total Invoices',
      value: Number(dashboardStats?.total) || 0,
      icon: <ReceiptIcon />,
      delay: 0.2,
      formattedValue: dashboardStats?.total?.toLocaleString('en-IN') || '0'
    },
    {
      title: 'Paid Amount',
      value: Number(dashboardStats?.paidAmount) || 0,
      icon: <PaidIcon />,
      delay: 0.3,
      formattedValue: formatCurrency(dashboardStats?.paidAmount || 0)
    },
    {
      title: 'Pending Amount',
      value: Number(dashboardStats?.pendingAmount) || 0,
      icon: <ScheduleIcon />,
      delay: 0.4,
      formattedValue: formatCurrency(dashboardStats?.pendingAmount || 0)
    }
  ];

  if (loading || invoicesLoading) {
    return (
      <Box>
        {/* Header Skeleton */}
        <Box sx={{ mb: 5 }}>
          <Skeleton variant="text" width={300} height={40} sx={{ bgcolor: '#334155', mb: 1 }} />
          <Skeleton variant="text" width={200} height={24} sx={{ bgcolor: '#334155' }} />
        </Box>

        {/* Stats Cards Skeleton */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: '12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155'
              }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#334155', mb: 2 }} />
                <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#334155', mb: 1 }} />
                <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: '#334155' }} />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Action Buttons Skeleton */}
        <Box sx={{ mb: 5, display: 'flex', gap: 2 }}>
          <Skeleton variant="rounded" width={180} height={40} sx={{ bgcolor: '#334155' }} />
          <Skeleton variant="rounded" width={120} height={40} sx={{ bgcolor: '#334155' }} />
        </Box>

        {/* Table Skeleton */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: '12px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155'
        }}>
          <Skeleton variant="text" width={150} height={28} sx={{ bgcolor: '#334155', mb: 3 }} />
          <Skeleton variant="rounded" width="100%" height={200} sx={{ bgcolor: '#334155' }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          fontWeight="500" 
          gutterBottom
          sx={{ 
            color: '#f1f5f9',
            letterSpacing: '-0.025em'
          }}
        >
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}
        >
          Your GST billing dashboard overview
        </Typography>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: stat.delay }}
            >
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      color: '#60a5fa',
                      fontSize: 24,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="h4" 
                  fontWeight="600"
                  sx={{ 
                    color: '#f1f5f9',
                    fontSize: '1.75rem'
                  }}
                >
                  {stat.formattedValue}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mb: 5, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/generate-invoice')}
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
            }
          }}
        >
          Create New Invoice
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/invoices')}
          sx={{
            borderRadius: '8px',
            fontWeight: 500,
            px: 3,
            minHeight: 40,
            fontSize: '0.875rem',
            borderColor: '#475569',
            color: '#e2e8f0',
            '&:hover': {
              borderColor: '#64748b',
              backgroundColor: 'rgba(255, 255, 255, 0.04)'
            }
          }}
        >
          View All Invoices
        </Button>
      </Box>

      {/* Recent Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.7 }}
      >
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
                color: '#f1f5f9'
              }}
            >
              Recent Invoices
            </Typography>
            <Button
              variant="text"
              onClick={() => navigate('/invoices')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                fontWeight: 500,
                color: '#60a5fa',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              View All
            </Button>
          </Box>

          {invoices && invoices.length > 0 ? (
            <TableContainer sx={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: '#0f172a'
                  }}>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }}>
                      Invoice No.
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }}>
                      Customer
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 500, 
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      py: 2,
                      borderBottom: '1px solid #334155'
                    }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.slice(0, 5).map((invoice) => {
                    const statusColors = getStatusColor(invoice.status);
                    return (
                      <TableRow 
                        key={invoice._id} 
                        sx={{ 
                          borderBottom: '1px solid #334155',
                          '&:last-child': { borderBottom: 0 },
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.02)'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="500"
                            sx={{ 
                              color: '#f1f5f9'
                            }}
                          >
                            {invoice.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: '#e2e8f0'
                            }}
                          >
                            {invoice.customer?.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              color: '#94a3b8'
                            }}
                          >
                            {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="600"
                            sx={{ 
                              color: '#f1f5f9'
                            }}
                          >
                            {formatCurrencyWithDecimals(invoice.grandTotal)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                              borderRadius: '6px',
                              px: 1,
                              height: 24,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/invoice/${invoice._id}`)}
                              title="View Invoice"
                              sx={{
                                color: '#94a3b8',
                                '&:hover': {
                                  color: '#60a5fa',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPDF(invoice)}
                              title="Download PDF"
                              sx={{
                                color: '#94a3b8',
                                '&:hover': {
                                  color: '#60a5fa',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                }
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <Box sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '12px', 
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}>
                <ReceiptIcon sx={{ color: '#60a5fa', fontSize: 32 }} />
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#e2e8f0',
                  mb: 3,
                  fontSize: '0.875rem'
                }}
              >
                No invoices found. Start by creating your first invoice!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/generate-invoice')}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 500,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  minHeight: 40,
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  }
                }}
              >
                Create Your First Invoice
              </Button>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}