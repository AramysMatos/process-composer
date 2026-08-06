import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState = {
  loading: false,
  registrationSuccess: false,
  registrationFailure: false,
  errorMessage: null,
  successMessage: null,
};

export type RegisterState = Readonly<typeof initialState>;

// Actions

export type RegisterResult = {
  autoActivated: boolean;
};

export const handleRegister = createAsyncThunk(
  'register/create_account',
  async (data: { login: string; email: string; password: string; langKey?: string }) => {
    const response = await axios.post<RegisterResult>('api/register', data);
    return response.data;
  },
  { serializeError: serializeAxiosError }
);

export const RegisterSlice = createSlice({
  name: 'register',
  initialState: initialState as RegisterState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(handleRegister.pending, state => {
        state.loading = true;
      })
      .addCase(handleRegister.rejected, (state, action) => ({
        ...initialState,
        registrationFailure: true,
        errorMessage: action.error.message,
      }))
      .addCase(handleRegister.fulfilled, (state, action) => ({
        ...initialState,
        registrationSuccess: true,
        successMessage: action.payload.autoActivated ? 'register.messages.success.autoActivated' : 'register.messages.success.pending',
      }));
  },
});

export const { reset } = RegisterSlice.actions;

// Reducer
export default RegisterSlice.reducer;
