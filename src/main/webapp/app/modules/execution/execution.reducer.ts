import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { AppDispatch, IRootState } from 'app/config/store';
import { getEntity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { ITask } from 'app/shared/model/task.model';
import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

import { buildIssueBody } from './github-issue-builder';

export interface GithubIssuePreview {
  taskId: number;
  title: string;
  body: string;
}

const initialState = {
  loading: false,
  error: null as string | null,
};

export type ExecutionState = Readonly<typeof initialState>;

/**
 * Activities nested in Task responses omit relationship arrays (see Task.java @JsonIgnoreProperties).
 * A fully hydrated activity exposes the fields needed by buildIssueBody.
 */
export function isActivityFullyHydrated(activity: IActivity): boolean {
  return (
    activity.requiredArtifacts !== undefined &&
    activity.producedArtifacts !== undefined &&
    activity.responsibleRoles !== undefined &&
    activity.participantRoles !== undefined
  );
}

type ExecutionThunkAPI = {
  getState: () => IRootState;
  dispatch: AppDispatch;
};

async function resolveActivity(activityRef: IActivity, thunkAPI: ExecutionThunkAPI): Promise<IActivity> {
  if (isActivityFullyHydrated(activityRef)) {
    return activityRef;
  }

  const cached = thunkAPI.getState().activity.entities.find(a => a.id === activityRef.id);
  if (cached && isActivityFullyHydrated(cached)) {
    return cached;
  }

  if (activityRef.id == null) {
    return activityRef;
  }

  const result = await thunkAPI.dispatch(getEntity(activityRef.id));
  if (getEntity.fulfilled.match(result)) {
    return result.payload.data;
  }

  throw result.payload ?? new Error(`Falha ao carregar atividade ${activityRef.id}`);
}

export const generateGithubIssuePreviews = createAsyncThunk<GithubIssuePreview[], ITask[], { state: IRootState }>(
  'execution/generate_issue_previews',
  async (tasks, thunkAPI) => {
    const previews: GithubIssuePreview[] = [];

    for (const task of tasks) {
      const activityRefs = task.activities ?? [];
      const hydrated = await Promise.all(activityRefs.map(ref => resolveActivity(ref, thunkAPI as ExecutionThunkAPI)));

      previews.push({
        taskId: task.id!,
        title: task.name ?? `tarefa ${task.id}`,
        body: buildIssueBody(task, hydrated),
      });
    }

    return previews;
  },
  { serializeError: serializeAxiosError }
);

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(generateGithubIssuePreviews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateGithubIssuePreviews.fulfilled, state => {
        state.loading = false;
      })
      .addCase(generateGithubIssuePreviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Falha ao gerar previews de issues do GitHub';
      });
  },
});

export const { reset } = executionSlice.actions;

export default executionSlice.reducer;
