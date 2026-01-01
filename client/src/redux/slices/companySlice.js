import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const getCompany = createAsyncThunk(
  'company/getCompany',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.get(`${API_URL}/company`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data.company
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch company profile')
    }
  }
)

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (companyData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.put(`${API_URL}/company`, companyData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data.company
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update company profile')
    }
  }
)

export const uploadLogo = createAsyncThunk(
  'company/uploadLogo',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.post(`${API_URL}/company/logo`, formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.company
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload logo')
    }
  }
)

export const deleteLogo = createAsyncThunk(
  'company/deleteLogo',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const response = await axios.delete(`${API_URL}/company/logo`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      return response.data.company
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete logo')
    }
  }
)

const companySlice = createSlice({
  name: 'company',
  initialState: {
    company: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCompanyError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Company
      .addCase(getCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCompany.fulfilled, (state, action) => {
        state.loading = false
        state.company = action.payload
      })
      .addCase(getCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false
        state.company = action.payload
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Logo
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.company = action.payload
      })
      // Delete Logo
      .addCase(deleteLogo.fulfilled, (state, action) => {
        state.company = action.payload
      })
  }
})

export const { clearCompanyError } = companySlice.actions
export default companySlice.reducer