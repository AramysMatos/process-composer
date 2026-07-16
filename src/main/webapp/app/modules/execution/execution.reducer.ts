import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { IRootState } from 'app/config/store';
import { ITask } from 'app/shared/model/task.model';
import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

import { buildIssueBody } from './github-issue-builder';
import { resolveActivity } from './execution.utils';

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

export const generateGithubIssuePreviews = createAsyncThunk<GithubIssuePreview[], ITask[], { state: IRootState }>(
  'execution/generate_issue_previews',
  async (tasks, thunkAPI) => {
    const previews: GithubIssuePreview[] = [];

    for (const task of tasks) {
      const activityRefs = task.activities ?? [];
      const hydrated = await Promise.all(activityRefs.map(ref => resolveActivity(ref, thunkAPI.dispatch, thunkAPI.getState)));

      const projectId = task.project?.id;
      const taskUrl =
        projectId != null
          ? `${window.location.origin}/projetos/${projectId}/tarefas?task=${task.id}`
          : `${window.location.origin}/task/${task.id}`;

      previews.push({
        taskId: task.id!,
        title: task.name ?? `tarefa ${task.id}`,
        body: buildIssueBody(task, hydrated, taskUrl),
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
