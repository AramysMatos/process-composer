import axios from 'axios';
import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

export interface IPlatformSetting {
  key?: string;
  value?: string;
  type?: 'BOOLEAN' | 'STRING' | 'NUMBER';
  labelKey?: string;
  descriptionKey?: string;
  publiclyReadable?: boolean;
  updatedAt?: string;
  updatedByLogin?: string | null;
}

const initialState = {
  loading: false,
  updatingKey: null as string | null,
  errorMessage: null as string | null,
  settings: [] as IPlatformSetting[],
  publicFlags: {} as Record<string, boolean>,
};

export type PlatformSettingsState = Readonly<typeof initialState>;

const adminUrl = 'api/admin/platform-settings';
const flagsUrl = 'api/platform-settings/flags';

export const getPlatformSettings = createAsyncThunk('platformSettings/fetch_all', async () => axios.get<IPlatformSetting[]>(adminUrl), {
  serializeError: serializeAxiosError,
});

export const updatePlatformSetting = createAsyncThunk(
  'platformSettings/update',
  async ({ key, value }: { key: string; value: string }) =>
    axios.put<IPlatformSetting>(`${adminUrl}/${encodeURIComponent(key)}`, { value }),
  { serializeError: serializeAxiosError }
);

export const getPublicFlags = createAsyncThunk(
  'platformSettings/fetch_public_flags',
  async () => axios.get<Record<string, boolean>>(flagsUrl),
  { serializeError: serializeAxiosError }
);

export const PlatformSettingsSlice = createSlice({
  name: 'platformSettings',
  initialState: initialState as PlatformSettingsState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getPlatformSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data;
        state.errorMessage = null;
      })
      .addCase(updatePlatformSetting.fulfilled, (state, action) => {
        state.updatingKey = null;
        state.settings = state.settings.map(setting => (setting.key === action.payload.data.key ? action.payload.data : setting));
        state.errorMessage = null;
      })
      .addCase(getPublicFlags.fulfilled, (state, action) => {
        state.publicFlags = action.payload.data;
      })
      .addMatcher(isPending(getPlatformSettings, getPublicFlags), state => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addMatcher(isPending(updatePlatformSetting), (state, action) => {
        state.updatingKey = action.meta.arg.key;
        state.errorMessage = null;
      })
      .addMatcher(isRejected(getPlatformSettings, getPublicFlags, updatePlatformSetting), (state, action) => {
        state.loading = false;
        state.updatingKey = null;
        state.errorMessage = action.error.message ?? null;
      });
  },
});

export const { reset } = PlatformSettingsSlice.actions;
export default PlatformSettingsSlice.reducer;
