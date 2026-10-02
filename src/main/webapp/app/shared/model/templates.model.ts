import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IActivity } from 'app/shared/model/activity.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';

export interface ITemplates extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  artifacts?: IArtifacts[] | null;
  activities?: IActivity[] | null;
}

export const defaultValue: Readonly<ITemplates> = {};
