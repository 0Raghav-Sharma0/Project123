import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (getState) => {
  const { auth } = getState();
  return auth.token || localStorage.getItem('token');
};

// Async thunk to fetch bank details
export const getBankDetails = createAsyncThunk(
  'bank/getBankDetails',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      console.log('Fetching bank details from:', `${API_URL}/bank`);
      
      const response = await axios.get(`${API_URL}/bank`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Bank details response:', response.data);
      return response.data.bank;
      
    } catch (error) {
      console.error('Error fetching bank details:', error);
      
      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to fetch bank details';
        console.error('Server error:', error.response.status, errorMessage);
        
        // If 401 unauthorized, clear local storage
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        // No response received
        console.error('No response received from server');
        return rejectWithValue('Server is not responding. Please check your connection.');
      } else {
        // Request setup error
        console.error('Request setup error:', error.message);
        return rejectWithValue(error.message || 'Failed to fetch bank details');
      }
    }
  }
);

// Async thunk to update bank details
export const updateBankDetails = createAsyncThunk(
  'bank/updateBankDetails',
  async (bankData, { rejectWithValue, getState }) => {
    try {
      const token = getAuthToken(getState);
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      console.log('Updating bank details:', bankData);
      
      const response = await axios.put(`${API_URL}/bank`, bankData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('Update response:', response.data);
      return response.data.bank;
      
    } catch (error) {
      console.error('Error updating bank details:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to update bank details';
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        return rejectWithValue('Server is not responding. Please check your connection.');
      } else {
        return rejectWithValue(error.message || 'Failed to update bank details');
      }
    }
  }
);

const bankSlice = createSlice({
  name: 'bank',
  initialState: {
    bank: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearBankError: (state) => {
      state.error = null;
    },
    clearBankData: (state) => {
      state.bank = null;
      state.error = null;
      state.lastUpdated = null;
    },
    setBankData: (state, action) => {
      state.bank = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Bank Details
      .addCase(getBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bank = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear bank data on error, keep existing data
      })
      // Update Bank Details
      .addCase(updateBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bank = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearBankError, clearBankData, setBankData } = bankSlice.actions;
export default bankSlice.reducer;