import { ITemplates } from 'app/shared/model/templates.model';
import { IActivity } from 'app/shared/model/activity.model';

export interface IArtifacts {
  id?: number;
  name?: string | null;
  description?: string | null;
  optional?: boolean | null;
  templates?: ITemplates[] | null;
  dependentActivities?: IActivity[] | null;
  producingActivities?: IActivity[] | null;
}

export const defaultValue: Readonly<IArtifacts> = {
  optional: false,
};
