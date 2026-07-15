import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IActivity } from 'app/shared/model/activity.model';

export interface ITemplates {
  id?: number;
  name?: string | null;
  description?: string | null;
  artifacts?: IArtifacts[] | null;
  activities?: IActivity[] | null;
}

export const defaultValue: Readonly<ITemplates> = {};
