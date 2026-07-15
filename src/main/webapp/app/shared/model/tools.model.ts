import { IActivity } from 'app/shared/model/activity.model';

export interface ITools {
  id?: number;
  name?: string | null;
  description?: string | null;
  activities?: IActivity[] | null;
}

export const defaultValue: Readonly<ITools> = {};
