import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const sendOtp = createAsyncThunk('auth/sendOtp', async (phoneNumber) => {
    const response = await api.post('auth/send-otp/', { phone_number: phoneNumber });
    return response.data;
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ phoneNumber, otp }) => {
    const response = await api.post('auth/verify-otp/', { phone_number: phoneNumber, otp });
    return response.data;
});

export const loginAdmin = createAsyncThunk('auth/loginAdmin', async ({ email, password }) => {
    const response = await api.post('auth/login/', { email, password });
    return response.data;
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (token) => {
    const response = await api.post('auth/google/', { token });
    return response.data;
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('access_token') || null,
        isAuthenticated: !!localStorage.getItem('access_token'),
        loading: false,
        error: null,
        otpSent: false,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.otpSent = false;
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        },
        resetError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.access;
                localStorage.setItem('access_token', action.payload.access);
                localStorage.setItem('refresh_token', action.payload.refresh);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.access;
                localStorage.setItem('access_token', action.payload.access);
                localStorage.setItem('refresh_token', action.payload.refresh);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(loginWithGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.access;
                localStorage.setItem('access_token', action.payload.access);
                localStorage.setItem('refresh_token', action.payload.refresh);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
