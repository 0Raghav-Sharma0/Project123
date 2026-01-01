import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invoiceService from '../../services/invoiceService';

// Async thunks
export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      console.log('Slice: Creating invoice with data:', invoiceData);
      const response = await invoiceService.createInvoice(invoiceData);
      console.log('Slice: Invoice created successfully:', response);
      return response;
    } catch (error) {
      console.error('Slice: Invoice creation failed:', error);
      
      // Extract detailed error message
      let errorMessage = error.message || 'Failed to create invoice';
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = validationErrors.map(err => err.msg || err).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getInvoices = createAsyncThunk(
  'invoices/getInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Alias for getInvoices to maintain compatibility with existing code
export const fetchInvoices = getInvoices;

export const getInvoice = createAsyncThunk(
  'invoices/getInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoice(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoice(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await invoiceService.deleteInvoice(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  'invoices/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    currentInvoice: null,
    dashboardStats: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.invoices.unshift(action.payload.invoice);
        state.currentInvoice = action.payload.invoice;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Get Invoices (and fetchInvoices alias)
      .addCase(getInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Single Invoice
      .addCase(getInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload.invoice;
      })
      .addCase(getInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Invoice
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.invoices.findIndex(invoice => invoice._id === action.payload.invoice._id);
        if (index !== -1) {
          state.invoices[index] = action.payload.invoice;
        }
        state.currentInvoice = action.payload.invoice;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(invoice => invoice._id !== action.payload.id);
        if (state.currentInvoice && state.currentInvoice._id === action.payload.id) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentInvoice, clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;