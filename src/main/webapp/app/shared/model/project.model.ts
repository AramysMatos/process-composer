import { ITask } from 'app/shared/model/task.model';
import { IProcess } from 'app/shared/model/process.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';
import { IUser } from 'app/shared/model/user.model';

export interface IProject extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  gitHubToken?: string | null;
  gitHubTokenConfigured?: boolean | null;
  gitHubRepository?: string | null;
  gitHubNodeId?: string | null;
  tasks?: ITask[] | null;
  process?: IProcess | null;
  owner?: Pick<IUser, 'id' | 'login' | 'firstName' | 'lastName'> | null;
}

export const defaultValue: Readonly<IProject> = {};
