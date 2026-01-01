import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';

const InvoiceTemplate = ({ invoice, company, bank }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ 
      width: '210mm', 
      minHeight: '297mm', 
      backgroundColor: '#ffffff', 
      color: '#000000',
      padding: '20mm',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      '@media print': {
        padding: '10mm',
        margin: 0,
        width: '100%',
      },
    }}>
      {/* Company Header */}
      <Box sx={{ mb: 4, borderBottom: '2px solid #000', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#000' }}>
          {company?.name || 'Your Company'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#000' }}>
          {company?.address?.street || 'Street'}, {company?.address?.city || 'City'}, 
          {company?.address?.state || 'State'} - {company?.address?.pincode || 'PIN'}
        </Typography>
        {company?.gstin && (
          <Typography variant="body2" sx={{ color: '#000' }}>
            GSTIN: {company.gstin}
          </Typography>
        )}
      </Box>

      {/* Invoice Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#000' }}>
            TAX INVOICE
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#000' }}>
            <strong>Bill To:</strong> {invoice.customer?.name || 'Customer'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#000' }}>
            {invoice.customer?.billingAddress?.street || ''}, 
            {invoice.customer?.billingAddress?.city || ''}, 
            {invoice.customer?.billingAddress?.state || ''} - 
            {invoice.customer?.billingAddress?.pincode || ''}
          </Typography>
          {invoice.customer?.gstin && (
            <Typography variant="body2" sx={{ color: '#000' }}>
              GSTIN: {invoice.customer.gstin}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ border: '1px solid #000', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, color: '#000' }}>
            <strong>Invoice No:</strong> {invoice.invoiceNumber || 'INV-001'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#000' }}>
            <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#000' }}>
            <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
          </Typography>
        </Box>
      </Box>

      {/* Products Table */}
      <TableContainer sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, py: 1, color: '#000' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, color: '#000' }} align="right">Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, color: '#000' }} align="right">Rate</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, color: '#000' }} align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell sx={{ py: 1, color: '#000' }}>{product.description || ''}</TableCell>
                <TableCell sx={{ py: 1, color: '#000' }} align="right">{product.quantity || 0}</TableCell>
                <TableCell sx={{ py: 1, color: '#000' }} align="right">
                  {formatCurrency(product.price || 0)}
                </TableCell>
                <TableCell sx={{ py: 1, color: '#000' }} align="right">
                  {formatCurrency(product.amount || product.quantity * product.price || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ width: '300px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#000' }}>Subtotal:</Typography>
            <Typography variant="body2" sx={{ color: '#000' }}>
              {formatCurrency(invoice.subtotal || 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#000' }}>CGST:</Typography>
            <Typography variant="body2" sx={{ color: '#000' }}>
              {formatCurrency(invoice.cgstTotal || 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#000' }}>SGST:</Typography>
            <Typography variant="body2" sx={{ color: '#000' }}>
              {formatCurrency(invoice.sgstTotal || 0)}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            p: 2,
            borderRadius: 1,
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#000' }}>
              Grand Total:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000' }}>
              {formatCurrency(invoice.grandTotal || 0)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 8, pt: 3, borderTop: '1px solid #000' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {bank && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#000' }}>
                Bank Details:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '12px', color: '#000' }}>
                {bank.bankName || ''}
                <br />
                A/C No: {bank.accountNumber || ''}
                <br />
                IFSC: {bank.ifscCode || ''}
              </Typography>
            </Box>
          )}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 3, color: '#000' }}>
              Authorized Signatory
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', color: '#000' }}>
              For {company?.name || 'Your Company'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceTemplate;