import axios from 'axios';
import { createAsyncThunk, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';
import { IPhase, defaultValue } from 'app/shared/model/phase.model';

const initialState: EntityState<IPhase> = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

const apiUrl = 'api/phases';

// Actions

export const getEntities = createAsyncThunk(
  'phase/fetch_entity_list',
  async (params: IQueryParams & { eagerload?: boolean; library?: boolean; processId?: number } = {}) => {
    const queryParts: string[] = [];
    if (params.eagerload) {
      queryParts.push('eagerload=true');
    }
    if (params.library) {
      queryParts.push('library=true');
    }
    if (params.processId !== undefined) {
      queryParts.push(`processId=${params.processId}`);
    }
    queryParts.push(`cacheBuster=${new Date().getTime()}`);
    const requestUrl = `${apiUrl}?${queryParts.join('&')}`;
    return axios.get<IPhase[]>(requestUrl);
  }
);

export const getEntity = createAsyncThunk(
  'phase/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IPhase>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createEntity = createAsyncThunk(
  'phase/create_entity',
  async (entity: IPhase, thunkAPI) => {
    const result = await axios.post<IPhase>(apiUrl, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const createEntitySilent = createAsyncThunk(
  'phase/create_entity_silent',
  async (entity: IPhase) => axios.post<IPhase>(apiUrl, cleanEntity(entity)),
  { serializeError: serializeAxiosError }
);

export const updateEntity = createAsyncThunk(
  'phase/update_entity',
  async (entity: IPhase, thunkAPI) => {
    const result = await axios.put<IPhase>(`${apiUrl}/${entity.id}`, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateEntitySilent = createAsyncThunk(
  'phase/update_entity_silent',
  async (entity: IPhase) => axios.put<IPhase>(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  { serializeError: serializeAxiosError }
);

export const partialUpdateEntity = createAsyncThunk(
  'phase/partial_update_entity',
  async (entity: IPhase, thunkAPI) => {
    const result = await axios.patch<IPhase>(`${apiUrl}/${entity.id}`, cleanEntity(entity));
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntity = createAsyncThunk(
  'phase/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<IPhase>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntitySilent = createAsyncThunk(
  'phase/delete_entity_silent',
  async (id: string | number) => axios.delete<IPhase>(`${apiUrl}/${id}`),
  { serializeError: serializeAxiosError }
);

// slice

export const PhaseSlice = createEntitySlice({
  name: 'phase',
  initialState,
  extraReducers(builder) {
    builder
      .addCase(getEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addCase(deleteEntity.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = {};
      })
      .addCase(deleteEntitySilent.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = {};
      })
      .addMatcher(isFulfilled(getEntities), (state, action) => {
        const { data } = action.payload;

        return {
          ...state,
          loading: false,
          entities: data,
        };
      })
      .addMatcher(isFulfilled(createEntity, updateEntity, partialUpdateEntity, createEntitySilent, updateEntitySilent), (state, action) => {
        state.updating = false;
        state.loading = false;
        state.updateSuccess = true;
        state.entity = action.payload.data;
      })
      .addMatcher(isPending(getEntities, getEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(
        isPending(
          createEntity,
          updateEntity,
          partialUpdateEntity,
          deleteEntity,
          deleteEntitySilent,
          createEntitySilent,
          updateEntitySilent
        ),
        state => {
          state.errorMessage = null;
          state.updateSuccess = false;
          state.updating = true;
        }
      );
  },
});

export const { reset } = PhaseSlice.actions;

// Reducer
export default PhaseSlice.reducer;
