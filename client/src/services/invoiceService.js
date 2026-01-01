import api from './api'
// Invoice services
export const invoiceService = {
  // Get all invoices
  getInvoices: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Get invoices error:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/invoices/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  // Get single invoice
  getInvoice: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get invoice error:', error);
      throw error;
    }
  },

  // Create invoice - FIXED VERSION
  createInvoice: async (invoiceData) => {
    try {
      console.log('Creating invoice with data:', invoiceData);
      
      // Clean and validate the data
      const cleanedData = {
        customer: {
          name: (invoiceData.customer?.name || '').trim(),
          gstin: (invoiceData.customer?.gstin || '').trim(),
          email: (invoiceData.customer?.email || '').trim(),
          phone: (invoiceData.customer?.phone || '').trim(),
          billingAddress: {
            street: (invoiceData.customer?.billingAddress?.street || '').trim(),
            city: (invoiceData.customer?.billingAddress?.city || '').trim(),
            state: (invoiceData.customer?.billingAddress?.state || '').trim(),
            pincode: (invoiceData.customer?.billingAddress?.pincode || '').trim(),
          }
        },
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        paymentTerms: invoiceData.paymentTerms || 'Net 30',
        notes: (invoiceData.notes || '').trim(),
        products: (invoiceData.products || []).map(product => ({
          description: (product.description || '').trim(),
          hsnCode: (product.hsnCode || '').trim(),
          quantity: parseFloat(product.quantity) || 0,
          unit: (product.unit || 'Nos').trim(),
          price: parseFloat(product.price) || 0,
          gstRate: parseFloat(product.gstRate) || 0
        })),
        status: invoiceData.status || 'generated'
      };

      // Add shipping address (copy from billing if not provided)
      if (invoiceData.customer?.shippingAddress) {
        cleanedData.customer.shippingAddress = {
          street: (invoiceData.customer.shippingAddress.street || '').trim(),
          city: (invoiceData.customer.shippingAddress.city || '').trim(),
          state: (invoiceData.customer.shippingAddress.state || '').trim(),
          pincode: (invoiceData.customer.shippingAddress.pincode || '').trim(),
        };
      } else {
        // Copy billing address to shipping address
        cleanedData.customer.shippingAddress = { ...cleanedData.customer.billingAddress };
      }

      console.log('Sending cleaned invoice data:', cleanedData);
      
      // IMPORTANT: Use relative URL since axios baseURL is already set
      const response = await api.post('/invoices', cleanedData);
      return response.data;
    } catch (error) {
      console.error('Create invoice error details:', error.response?.data || error.message);
      
      // Format user-friendly error message
      let errorMessage = 'Failed to create invoice';
      
      if (error.response?.data) {
        const { data } = error.response;
        
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors from express-validator
          errorMessage = data.errors.map(err => err.msg || err.message || err).join(', ');
        } else if (data.details && Array.isArray(data.details)) {
          // Detailed validation errors
          errorMessage = data.details.map(detail => detail.message || detail).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Update invoice
  updateInvoice: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Update invoice error:', error);
      throw error;
    }
  },

  // Update invoice status
  updateInvoiceStatus: async (id, status) => {
    try {
      const response = await api.patch(`/invoices/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update invoice status error:', error);
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete invoice error:', error);
      throw error;
    }
  },

  // Generate invoice number
  generateInvoiceNumber: async () => {
    try {
      const response = await api.get('/invoices/generate-number');
      return response.data;
    } catch (error) {
      console.error('Generate invoice number error:', error);
      throw error;
    }
  },

  // Test connection - ADD THIS NEW METHOD
  testConnection: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Test connection error:', error);
      throw error;
    }
  }
};

export default invoiceService;