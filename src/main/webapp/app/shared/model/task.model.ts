import { IActivity } from 'app/shared/model/activity.model';
import { IProject } from 'app/shared/model/project.model';

export interface ITask {
  id?: number;
  name?: string | null;
  description?: string | null;
  gitHubUrl?: string | null;
  gitHubNodeId?: string | null;
  activities?: IActivity[] | null;
  project?: IProject | null;
}

export const defaultValue: Readonly<ITask> = {};
