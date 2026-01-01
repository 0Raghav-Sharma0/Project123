import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { fetchInvoices, deleteInvoice } from "../redux/slices/invoiceSlice";

const getStatusColor = (status) => {
  const colors = {
    paid: {
      bg: "rgba(16, 185, 129, 0.1)",
      text: "#34d399",
      border: "1px solid rgba(16, 185, 129, 0.2)",
    },
    overdue: {
      bg: "rgba(239, 68, 68, 0.1)",
      text: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    },
    generated: {
      bg: "rgba(59, 130, 246, 0.1)",
      text: "#60a5fa",
      border: "1px solid rgba(59, 130, 246, 0.2)",
    },
    sent: {
      bg: "rgba(245, 158, 11, 0.1)",
      text: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.2)",
    },
    draft: {
      bg: "rgba(148, 163, 184, 0.1)",
      text: "#94a3b8",
      border: "1px solid rgba(148, 163, 184, 0.2)",
    },
    cancelled: {
      bg: "rgba(148, 163, 184, 0.1)",
      text: "#94a3b8",
      border: "1px solid rgba(148, 163, 184, 0.2)",
    },
  };

  return colors[status] || colors.draft;
};

export default function InvoicesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { invoices, loading } = useSelector((state) => state.invoices);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      await dispatch(fetchInvoices()).unwrap();
    } catch (error) {
      enqueueSnackbar("Failed to load invoices", { variant: "error" });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteInvoice(invoiceToDelete._id)).unwrap();
      enqueueSnackbar("Invoice deleted successfully", { variant: "success" });
      setDeleteDialog(false);
      setInvoiceToDelete(null);
    } catch (error) {
      enqueueSnackbar("Failed to delete invoice", { variant: "error" });
    }
  };

  const handleDownloadPDF = (invoice) => {
    navigate(`/invoice/${invoice._id}?download=true`);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="500"
            sx={{
              color: "#f1f5f9",
              mb: 0.5,
              letterSpacing: "-0.025em",
            }}
          >
            Invoices
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            Manage and view all your invoices
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/generate-invoice"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: "8px",
            fontWeight: 500,
            px: 3,
            minHeight: 40,
            fontSize: "0.875rem",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
          }}
        >
          New Invoice
        </Button>
      </Box>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search invoices by number or customer name..."
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          InputLabelProps={{
            sx: {
              color: "#94a3b8",
              "&.Mui-focused": {
                color: "#3b82f6",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
            sx: {
              color: "#f1f5f9",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              fontSize: "0.875rem",
              "&.Mui-focused fieldset": {
                borderColor: "#3b82f6",
                borderWidth: "1px",
              },
            },
          }}
        />
      </Paper>

      {loading && (
        <LinearProgress
          sx={{
            mb: 3,
            height: 2,
            borderRadius: 1,
            backgroundColor: "#334155",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#3b82f6",
            },
          }}
        />
      )}

      {!loading && filteredInvoices.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderRadius: "12px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "12px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <ReceiptIcon sx={{ color: "#60a5fa", fontSize: 32 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: "#f1f5f9",
              fontWeight: 500,
              mb: 1,
            }}
          >
            {invoices.length === 0
              ? "No invoices found"
              : "No invoices match your search"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              mb: 3,
              fontSize: "0.875rem",
            }}
          >
            {invoices.length === 0
              ? "Create your first invoice to get started"
              : "Try searching with different terms"}
          </Typography>
          {invoices.length === 0 && (
            <Button
              component={Link}
              to="/generate-invoice"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: "8px",
                fontWeight: 500,
                px: 3,
                minHeight: 40,
                fontSize: "0.875rem",
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
              }}
            >
              Create First Invoice
            </Button>
          )}
        </Box>
      )}

      {!loading && filteredInvoices.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#0f172a",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                >
                  Invoice #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                >
                  Customer
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                  align="right"
                >
                  Amount
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    borderBottom: "1px solid #334155",
                    py: 2,
                  }}
                  align="right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const statusColors = getStatusColor(invoice.status);
                return (
                  <TableRow
                    key={invoice._id}
                    sx={{
                      borderBottom: "1px solid #334155",
                      "&:last-child": { borderBottom: 0 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight="400"
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.875rem",
                        }}
                      >
                        {invoice.invoiceNumber || "DRAFT"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#e2e8f0",
                          fontSize: "0.875rem",
                        }}
                      >
                        {invoice.customer?.name || "No Name"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatDate(invoice.invoiceDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{
                          color: "#f1f5f9",
                          fontSize: "0.875rem",
                        }}
                      >
                        {formatCurrency(invoice.grandTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={
                          (invoice.status || "draft").charAt(0).toUpperCase() +
                          (invoice.status || "draft").slice(1)
                        }
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          border: statusColors.border,
                          borderRadius: "6px",
                          height: "24px",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/invoice/${invoice._id}`}
                          title="View"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": {
                              color: "#60a5fa",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/edit-invoice/${invoice._id}`}
                          title="Edit"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": {
                              color: "#60a5fa",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPDF(invoice)}
                          title="Download PDF"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": {
                              color: "#60a5fa",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(invoice)}
                          title="Delete"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": {
                              color: "#f87171",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            fontWeight: 500,
            fontSize: "1rem",
            borderBottom: "1px solid #334155",
            color: "#f1f5f9",
          }}
        >
          Delete Invoice
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              mx: "auto",
            }}
          >
            <DeleteIcon sx={{ color: "#f87171", fontSize: 24 }} />
          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "#e2e8f0",
              mb: 2,
              fontSize: "0.875rem",
            }}
          >
            Are you sure you want to delete invoice{" "}
            <Box component="span" sx={{ color: "#f1f5f9", fontWeight: 500 }}>
              {invoiceToDelete?.invoiceNumber}
            </Box>
            ?
          </Typography>
          <Alert
            severity="warning"
            sx={{
              borderRadius: "8px",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              color: "#fbbf24",
              "& .MuiAlert-icon": {
                color: "#fbbf24",
              },
            }}
          >
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            borderTop: "1px solid #334155",
          }}
        >
          <Button
            onClick={() => setDeleteDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              px: 3,
              py: 1,
              fontWeight: 500,
              fontSize: "0.875rem",
              minHeight: 40,
              borderColor: "#475569",
              color: "#e2e8f0",
              "&:hover": {
                borderColor: "#64748b",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              borderRadius: "8px",
              px: 4,
              py: 1,
              fontWeight: 500,
              fontSize: "0.875rem",
              minHeight: 40,
              backgroundColor: "#ef4444",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}