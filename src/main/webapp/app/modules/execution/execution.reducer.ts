import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { AppDispatch, IRootState } from 'app/config/store';
import { getEntity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { ITask } from 'app/shared/model/task.model';
import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

import { buildIssueBody } from './github-issue-builder';

const githubApiUrl = (projectId: number) => `api/projects/${projectId}/github`;

export interface GithubIssuePreview {
  taskId: number;
  title: string;
  body: string;
}

export interface GithubIssuePublishRequest {
  taskId: number;
  title: string;
  body: string;
}

export interface GithubIssuePublishResult {
  taskId: number;
  gitHubUrl: string;
  gitHubNodeId: string;
}

const initialState = {
  loading: false,
  publishing: false,
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

// TODO backend: POST /api/projects/{id}/github/validate — uses token/repo saved on the Project.
export const validateGithubConnection = createAsyncThunk<void, number, { state: IRootState }>(
  'execution/validate_github_connection',
  async (projectId, thunkAPI) => {
    try {
      await axios.post(`${githubApiUrl(projectId)}/validate`);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
  { serializeError: serializeAxiosError }
);

// TODO backend: POST /api/projects/{id}/github/issues — creates issues via backend (token never in browser).
export const publishGithubIssues = createAsyncThunk<
  GithubIssuePublishResult[],
  { projectId: number; issues: GithubIssuePublishRequest[] },
  { state: IRootState }
>(
  'execution/publish_github_issues',
  async ({ projectId, issues }, thunkAPI) => {
    try {
      const response = await axios.post<GithubIssuePublishResult[]>(`${githubApiUrl(projectId)}/issues`, issues);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
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
      })
      .addCase(validateGithubConnection.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateGithubConnection.fulfilled, state => {
        state.loading = false;
      })
      .addCase(validateGithubConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Falha ao validar conexão com o GitHub';
      })
      .addCase(publishGithubIssues.pending, state => {
        state.publishing = true;
        state.error = null;
      })
      .addCase(publishGithubIssues.fulfilled, state => {
        state.publishing = false;
      })
      .addCase(publishGithubIssues.rejected, (state, action) => {
        state.publishing = false;
        state.error = action.error.message ?? 'Falha ao publicar issues no GitHub';
      });
  },
});

export const { reset } = executionSlice.actions;

export default executionSlice.reducer;
