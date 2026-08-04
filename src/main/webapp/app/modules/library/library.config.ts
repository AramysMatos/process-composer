import { AsyncThunk } from '@reduxjs/toolkit';

import * as rolesReducer from 'app/entities/roles/roles.reducer';
import * as toolsReducer from 'app/entities/tools/tools.reducer';
import * as guidelinesReducer from 'app/entities/guidelines/guidelines.reducer';
import * as artifactsReducer from 'app/entities/artifacts/artifacts.reducer';
import * as templatesReducer from 'app/entities/templates/templates.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts, defaultValue as artifactsDefaultValue } from 'app/shared/model/artifacts.model';
import { IGuidelines, defaultValue as guidelinesDefaultValue } from 'app/shared/model/guidelines.model';
import { IRoles, defaultValue as rolesDefaultValue } from 'app/shared/model/roles.model';
import { ITemplates, defaultValue as templatesDefaultValue } from 'app/shared/model/templates.model';
import { ITools, defaultValue as toolsDefaultValue } from 'app/shared/model/tools.model';
import { IOwnedEntity } from 'app/shared/model/owned-entity.model';
import { IQueryParams } from 'app/shared/reducers/reducer.utils';

export type LibraryEntityType = 'roles' | 'tools' | 'guidelines' | 'artifacts' | 'templates';

export type LibraryTabType = LibraryEntityType | 'activities' | 'phases';

export const LIBRARY_ENTITY_TYPES: LibraryEntityType[] = ['roles', 'tools', 'guidelines', 'artifacts', 'templates'];

export const LIBRARY_TAB_TYPES: LibraryTabType[] = [...LIBRARY_ENTITY_TYPES, 'activities', 'phases'];

export const isLibraryEntityType = (value: string | undefined): value is LibraryEntityType =>
  value !== undefined && LIBRARY_ENTITY_TYPES.includes(value as LibraryEntityType);

export const isLibraryTabType = (value: string | undefined): value is LibraryTabType =>
  value !== undefined && LIBRARY_TAB_TYPES.includes(value as LibraryTabType);

export interface LibraryActivityRef {
  activity: IActivity;
  relationLabelKey: string;
}

export interface LibraryEntityBase extends IOwnedEntity {
  id?: number;
  name?: string | null;
  description?: string | null;
  optional?: boolean | null;
}

type EntityThunks<T> = {
  getEntities: AsyncThunk<unknown, IQueryParams, object>;
  getEntity: AsyncThunk<unknown, string | number, object>;
  createEntity: AsyncThunk<unknown, T, object>;
  updateEntity: AsyncThunk<unknown, T, object>;
  deleteEntity: AsyncThunk<unknown, string | number, object>;
  reset: () => { type: string };
};

export interface LibraryEntityConfig<T extends LibraryEntityBase> {
  type: LibraryEntityType;
  tabLabelKey: string;
  sliceKey: LibraryEntityType;
  defaultValue: T;
  showOptional: boolean;
  thunks: EntityThunks<T>;
  extractActivityRefs: (entity: T) => LibraryActivityRef[];
}

const appendActivities = (
  refs: LibraryActivityRef[],
  activities: IActivity[] | null | undefined,
  relationLabelKey: string
): LibraryActivityRef[] => {
  activities?.forEach(activity => {
    if (activity?.id) {
      refs.push({ activity, relationLabelKey });
    }
  });
  return refs;
};

export const LIBRARY_ENTITY_CONFIGS: Record<LibraryEntityType, LibraryEntityConfig<LibraryEntityBase>> = {
  roles: {
    type: 'roles',
    tabLabelKey: 'processComposerApp.library.tabs.roles',
    sliceKey: 'roles',
    defaultValue: rolesDefaultValue,
    showOptional: false,
    thunks: rolesReducer as EntityThunks<IRoles>,
    extractActivityRefs: entity => {
      const refs: LibraryActivityRef[] = [];
      appendActivities(refs, (entity as IRoles).participantActivities, 'processComposerApp.library.usedIn.participant');
      appendActivities(refs, (entity as IRoles).responsibleActivities, 'processComposerApp.library.usedIn.responsible');
      return refs;
    },
  },
  tools: {
    type: 'tools',
    tabLabelKey: 'processComposerApp.library.tabs.tools',
    sliceKey: 'tools',
    defaultValue: toolsDefaultValue,
    showOptional: false,
    thunks: toolsReducer as EntityThunks<ITools>,
    extractActivityRefs: entity => {
      const refs: LibraryActivityRef[] = [];
      appendActivities(refs, (entity as ITools).activities, 'processComposerApp.library.usedIn.tool');
      return refs;
    },
  },
  guidelines: {
    type: 'guidelines',
    tabLabelKey: 'processComposerApp.library.tabs.guidelines',
    sliceKey: 'guidelines',
    defaultValue: guidelinesDefaultValue,
    showOptional: false,
    thunks: guidelinesReducer as EntityThunks<IGuidelines>,
    extractActivityRefs: entity => {
      const refs: LibraryActivityRef[] = [];
      appendActivities(refs, (entity as IGuidelines).activities, 'processComposerApp.library.usedIn.guideline');
      return refs;
    },
  },
  artifacts: {
    type: 'artifacts',
    tabLabelKey: 'processComposerApp.library.tabs.artifacts',
    sliceKey: 'artifacts',
    defaultValue: artifactsDefaultValue,
    showOptional: true,
    thunks: artifactsReducer as EntityThunks<IArtifacts>,
    extractActivityRefs: entity => {
      const refs: LibraryActivityRef[] = [];
      appendActivities(refs, (entity as IArtifacts).dependentActivities, 'processComposerApp.library.usedIn.required');
      appendActivities(refs, (entity as IArtifacts).producingActivities, 'processComposerApp.library.usedIn.produced');
      return refs;
    },
  },
  templates: {
    type: 'templates',
    tabLabelKey: 'processComposerApp.library.tabs.templates',
    sliceKey: 'templates',
    defaultValue: templatesDefaultValue,
    showOptional: false,
    thunks: templatesReducer as EntityThunks<ITemplates>,
    extractActivityRefs: entity => {
      const refs: LibraryActivityRef[] = [];
      appendActivities(refs, (entity as ITemplates).activities, 'processComposerApp.library.usedIn.template');
      return refs;
    },
  },
};
