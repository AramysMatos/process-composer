import { IActivity } from 'app/shared/model/activity.model';

export interface IRoles {
  id?: number;
  name?: string | null;
  description?: string | null;
  participantActivities?: IActivity[] | null;
  responsibleActivities?: IActivity[] | null;
}

export const defaultValue: Readonly<IRoles> = {};
