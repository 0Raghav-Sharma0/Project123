import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Stack,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Paid as PaidIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { getInvoice, updateInvoice } from "../redux/slices/invoiceSlice";
import InvoiceTemplate from "../components/InvoiceTemplate"; // ADD THIS IMPORT
import { generatePDF } from "../services/pdfGenerator";

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const invoiceRef = useRef();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);

  const { currentInvoice, loading: invoiceLoading } = useSelector(
    (state) => state.invoices
  );
  const { company } = useSelector((state) => state.company);
  const { bank } = useSelector((state) => state.bank);

  useEffect(() => {
    if (id) {
      dispatch(getInvoice(id));
    }
  }, [id, dispatch]);

  const handleDownloadPDF = async () => {
    try {
      setPdfLoading(true);
      // Wait a moment for DOM to render properly
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use the correct element ID (the container div)
      await generatePDF("invoice-container", `invoice-${currentInvoice.invoiceNumber || currentInvoice._id}.pdf`);
      
      enqueueSnackbar("PDF downloaded successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      enqueueSnackbar(`Failed to download PDF: ${error.message}`, {
        variant: "error",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      await dispatch(
        updateInvoice({
          id: currentInvoice._id,
          data: { status: "paid" },
        })
      ).unwrap();
      enqueueSnackbar("Invoice marked as paid!", {
        variant: "success",
      });
      setMarkPaidDialogOpen(false);
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to update invoice", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: {
        bg: "#dcfce7",
        text: "#15803d",
      },
      overdue: {
        bg: "#fef2f2",
        text: "#dc2626",
      },
      generated: {
        bg: "#e0e7ff",
        text: "#1d4ed8",
      },
      sent: {
        bg: "#fffbeb",
        text: "#d97706",
      },
      draft: {
        bg: "#f9fafb",
        text: "#6b7280",
      },
    };

    return colors[status] || colors.draft;
  };

  if (invoiceLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress
          size={32}
          thickness={4}
          sx={{
            color: "#1d4ed8",
            mb: 3,
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: "#6b7280",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Loading invoice details...
        </Typography>
      </Box>
    );
  }

  if (!currentInvoice) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box textAlign="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <DescriptionIcon sx={{ color: "#1d4ed8", fontSize: 40 }} />
          </Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "#111827",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Invoice not found
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              mb: 4,
              lineHeight: 1.6,
              fontSize: "0.875rem",
              fontWeight: 400,
            }}
          >
            The invoice you're looking for doesn't exist or has been deleted.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/invoices")}
            sx={{
              mt: 2,
              px: 4,
              py: 1,
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.875rem",
              minHeight: 40,
              backgroundColor: "#1d4ed8",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#1e40af",
              },
            }}
          >
            Back to Invoices
          </Button>
        </Box>
      </Container>
    );
  }

  const statusColors = getStatusColor(currentInvoice.status);

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Bar */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  onClick={() => navigate("/invoices")}
                  size="medium"
                  sx={{
                    mr: 1,
                    color: "#6b7280",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #d1d5db",
                    "&:hover": {
                      color: "#1d4ed8",
                      backgroundColor: "#e0e7ff",
                      borderColor: "#1d4ed8",
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>

                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      fontSize: "1.5rem",
                      color: "#111827",
                      mb: 0.5,
                    }}
                  >
                    Invoice #{currentInvoice.invoiceNumber}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <Chip
                      label={
                        currentInvoice.status?.charAt(0).toUpperCase() +
                        currentInvoice.status?.slice(1)
                      }
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        borderRadius: "4px",
                        height: "24px",
                        border: `1px solid ${statusColors.bg}`,
                        letterSpacing: "0.025em",
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <CalendarIcon
                        sx={{ fontSize: "0.875rem", color: "#6b7280" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.875rem",
                          color: "#374151",
                          fontWeight: 600,
                        }}
                      >
                        {formatDate(currentInvoice.invoiceDate)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <MoneyIcon
                        sx={{ fontSize: "0.875rem", color: "#1d4ed8" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#1d4ed8",
                        }}
                      >
                        {formatCurrency(currentInvoice.grandTotal || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 0.75,
                    borderColor: "#1d4ed8",
                    color: "#1d4ed8",
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      borderColor: "#1e40af",
                      backgroundColor: "#e0e7ff",
                    },
                  }}
                >
                  Print
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    pdfLoading ? (
                      <CircularProgress size={16} sx={{ color: "#ffffff" }} />
                    ) : (
                      <PdfIcon />
                    )
                  }
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 0.75,
                    backgroundColor: "#1d4ed8",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#1e40af",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#d1d5db",
                      color: "#9ca3af",
                    },
                  }}
                >
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/edit-invoice/${currentInvoice._id}`)}
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    px: 2,
                    py: 0.75,
                    borderColor: "#1d4ed8",
                    color: "#1d4ed8",
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      borderColor: "#1e40af",
                      backgroundColor: "#e0e7ff",
                    },
                  }}
                >
                  Edit
                </Button>

                {currentInvoice.status !== "paid" && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PaidIcon />}
                    onClick={() => setMarkPaidDialogOpen(true)}
                    sx={{
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      px: 2,
                      py: 0.75,
                      backgroundColor: "#15803d",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#166534",
                      },
                    }}
                  >
                    Mark Paid
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Customer & Invoice Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                height: "100%",
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    color: "#111827",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 1,
                  }}
                >
                  Customer Information
                </Typography>
              </Box>

              <Box sx={{ pl: 0.5 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    mb: 2,
                    fontSize: "1rem",
                    color: "#111827",
                  }}
                >
                  {currentInvoice.customer?.name || "N/A"}
                </Typography>

                {currentInvoice.customer?.gstin && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      backgroundColor: "#e0e7ff",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      mb: 3,
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="#1d4ed8"
                    >
                      GSTIN:
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#111827">
                      {currentInvoice.customer.gstin}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {currentInvoice.customer?.billingAddress?.street || ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {currentInvoice.customer?.billingAddress?.city || ""},{" "}
                    {currentInvoice.customer?.billingAddress?.state || ""} -{" "}
                    {currentInvoice.customer?.billingAddress?.pincode || ""}
                  </Typography>
                  {currentInvoice.customer?.phone && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {currentInvoice.customer.phone}
                    </Typography>
                  )}
                  {currentInvoice.customer?.email && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {currentInvoice.customer.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                height: "100%",
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    color: "#111827",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 1,
                  }}
                >
                  Invoice Details
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="#6b7280"
                      display="block"
                      sx={{
                        mb: 1,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Invoice Date
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: "#111827", fontSize: "0.875rem" }}
                    >
                      {formatDate(currentInvoice.invoiceDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="#6b7280"
                      display="block"
                      sx={{
                        mb: 1,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Subtotal
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: "#111827", fontSize: "0.875rem" }}
                    >
                      {formatCurrency(currentInvoice.subtotal || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="#6b7280"
                      display="block"
                      sx={{
                        mb: 1,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Due Date
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: "#111827", fontSize: "0.875rem" }}
                    >
                      {formatDate(currentInvoice.dueDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="#6b7280"
                      display="block"
                      sx={{
                        mb: 1,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Total Tax
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: "#dc2626", fontSize: "0.875rem" }}
                    >
                      {formatCurrency(
                        (currentInvoice.cgstTotal || 0) +
                          (currentInvoice.sgstTotal || 0)
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider
                    sx={{ my: 2, borderColor: "#d1d5db", borderWidth: "1px" }}
                  />
                  <Box
                    sx={{
                      pt: 2,
                      pb: 1,
                      backgroundColor: "#1e3a8a",
                      borderRadius: "6px",
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="#bfdbfe"
                      display="block"
                      sx={{
                        mb: 0.5,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Grand Total
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: "#ffffff" }}
                    >
                      {formatCurrency(currentInvoice.grandTotal || 0)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Invoice Preview - FIXED: Added InvoiceTemplate */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1px solid #d1d5db",
            mb: 3,
            overflow: "hidden",
          }}
        >
          {/* This div MUST have the ID that matches the PDF generator */}
          <div id="invoice-container">
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                overflow: "auto",
                py: 3,
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            >
              <Box
                sx={{
                  transform: {
                    xs: "scale(0.9)",
                    sm: "scale(0.95)",
                    md: "scale(1)",
                  },
                  transformOrigin: "top center",
                  borderRadius: 1,
                  overflow: "hidden",
                  backgroundColor: "#ffffff", // Ensure white background
                }}
              >
                {/* ADD THIS InvoiceTemplate Component */}
                <InvoiceTemplate
                  invoice={currentInvoice}
                  company={company}
                  bank={bank}
                />
              </Box>
            </Box>
          </div>
        </Paper>

        {/* Mark as Paid Dialog */}
        <Dialog
          open={markPaidDialogOpen}
          onClose={() => setMarkPaidDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 2,
              fontWeight: 700,
              fontSize: "1rem",
              borderBottom: "1px solid #d1d5db",
              color: "#111827",
            }}
          >
            Mark Invoice as Paid
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Alert
              severity="info"
              sx={{
                mb: 3,
                fontSize: "0.875rem",
                borderRadius: "6px",
                backgroundColor: "#e0e7ff",
                border: "1px solid #c7d2fe",
                color: "#1d4ed8",
                fontWeight: 500,
                "& .MuiAlert-icon": {
                  color: "#1d4ed8",
                },
              }}
            >
              This action will update the invoice status to{" "}
              <strong>PAID</strong> and may trigger notifications to the client.
            </Alert>
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                fontWeight: 500,
                mb: 2,
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Are you sure you want to mark invoice{" "}
              <strong>#{currentInvoice.invoiceNumber}</strong> as paid?
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: "#1e3a8a",
                borderRadius: "6px",
                border: "1px solid #1e40af",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.75rem",
                  color: "#bfdbfe",
                  display: "block",
                  mb: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Total Amount
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: "#ffffff" }}
              >
                {formatCurrency(currentInvoice.grandTotal || 0)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              pt: 2,
              borderTop: "1px solid #d1d5db",
            }}
          >
            <Button
              onClick={() => setMarkPaidDialogOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: "6px",
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 40,
                borderColor: "#1d4ed8",
                color: "#1d4ed8",
                backgroundColor: "#ffffff",
                "&:hover": {
                  borderColor: "#1e40af",
                  backgroundColor: "#e0e7ff",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  <PaidIcon />
                )
              }
              sx={{
                borderRadius: "6px",
                px: 4,
                py: 1,
                fontWeight: 700,
                fontSize: "0.875rem",
                minHeight: 40,
                backgroundColor: "#15803d",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#166534",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#d1d5db",
                  color: "#9ca3af",
                },
              }}
            >
              {loading ? "Processing..." : "Mark as Paid"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}