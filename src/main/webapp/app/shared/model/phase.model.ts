import { IActivity } from 'app/shared/model/activity.model';
import { IProcess } from 'app/shared/model/process.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';

export interface IPhase extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  activities?: IActivity[] | null;
  process?: IProcess | null;
}

export const defaultValue: Readonly<IPhase> = {};
