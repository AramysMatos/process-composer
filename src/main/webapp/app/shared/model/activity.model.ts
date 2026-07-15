import { ITemplates } from 'app/shared/model/templates.model';
import { IGuidelines } from 'app/shared/model/guidelines.model';
import { IRoles } from 'app/shared/model/roles.model';
import { ITools } from 'app/shared/model/tools.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IPhase } from 'app/shared/model/phase.model';
import { ITask } from 'app/shared/model/task.model';

export interface IActivity {
  id?: number;
  name?: string | null;
  description?: string | null;
  inputCriterion?: string | null;
  subActivities?: IActivity[] | null;
  templates?: ITemplates[] | null;
  guidelines?: IGuidelines[] | null;
  participantRoles?: IRoles[] | null;
  responsibleRoles?: IRoles[] | null;
  tools?: ITools[] | null;
  requiredArtifacts?: IArtifacts[] | null;
  producedArtifacts?: IArtifacts[] | null;
  phase?: IPhase | null;
  tasks?: ITask[] | null;
  predecessorActivities?: IActivity[] | null;
}

export const defaultValue: Readonly<IActivity> = {};
