import { IPhase } from 'app/shared/model/phase.model';
import { IProject } from 'app/shared/model/project.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';
import { IUser } from 'app/shared/model/user.model';

export interface IProcess extends IOwnedEntity {
  id?: number;
  processName?: string | null;
  processDescription?: string | null;
  phases?: IPhase[] | null;
  projects?: IProject[] | null;
  owner?: Pick<IUser, 'id' | 'login' | 'firstName' | 'lastName'> | null;
}

export const defaultValue: Readonly<IProcess> = {};
