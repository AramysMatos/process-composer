import { IActivity } from 'app/shared/model/activity.model';

export interface IGuidelines {
  id?: number;
  name?: string | null;
  description?: string | null;
  activities?: IActivity[] | null;
}

export const defaultValue: Readonly<IGuidelines> = {};
