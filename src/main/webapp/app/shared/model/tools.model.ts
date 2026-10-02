import { IActivity } from 'app/shared/model/activity.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';

export interface ITools extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  activities?: IActivity[] | null;
}

export const defaultValue: Readonly<ITools> = {};
