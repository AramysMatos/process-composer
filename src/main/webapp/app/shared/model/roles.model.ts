import { IActivity } from 'app/shared/model/activity.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';

export interface IRoles extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  participantActivities?: IActivity[] | null;
  responsibleActivities?: IActivity[] | null;
}

export const defaultValue: Readonly<IRoles> = {};
