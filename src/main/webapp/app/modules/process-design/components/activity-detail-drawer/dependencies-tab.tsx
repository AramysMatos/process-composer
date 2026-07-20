import React, { useMemo } from 'react';
import { FormGroup, Label } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { useAppSelector } from 'app/config/store';
import { IActivity } from 'app/shared/model/activity.model';
import { EntityComboboxCreatable } from 'app/shared-ui/entity-combobox-creatable';
import { toComboboxItems } from './activity-drawer.utils';

export interface DependenciesTabProps {
  draft: IActivity;
  processId?: number;
  phaseId?: number;
  onChange: (updated: IActivity) => void;
  disabled?: boolean;
}

const sortActivities = (activities: IActivity[]): IActivity[] =>
  [...activities].sort((left, right) => {
    const nameCompare = (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return (left.id ?? 0) - (right.id ?? 0);
  });

export const DependenciesTab = ({ draft, processId, phaseId, onChange, disabled = false }: DependenciesTabProps) => {
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const activityEntities = useAppSelector(state => state.activity.entities);

  const activityOptions = useMemo(() => {
    if (!draft.id || (!processId && phaseId === undefined)) {
      return [];
    }

    const eligibleActivities = activityEntities.filter(activity => {
      if (activity.id === draft.id || activity.phase?.id === undefined) {
        return false;
      }

      if (processId) {
        const processPhaseIds = new Set(
          phaseEntities.filter(phase => phase.process?.id === processId).flatMap(phase => (phase.id !== undefined ? [phase.id] : []))
        );
        return processPhaseIds.has(activity.phase.id);
      }

      return activity.phase.id === phaseId;
    });

    return toComboboxItems(sortActivities(eligibleActivities));
  }, [activityEntities, draft.id, phaseEntities, phaseId, processId]);

  return (
    <div className="activity-detail-drawer__dependencies-tab">
      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-predecessors">
          <Translate contentKey="processComposerApp.processDesign.drawer.dependencies.predecessors">Predecessor activities</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-predecessors"
          options={activityOptions}
          value={toComboboxItems(draft.predecessorActivities)}
          onChange={selected =>
            onChange({
              ...draft,
              predecessorActivities: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          disabled={disabled || (!processId && phaseId === undefined)}
          data-cy="activity-drawer-predecessors"
        />
      </FormGroup>

      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-sub-activities">
          <Translate contentKey="processComposerApp.processDesign.drawer.dependencies.subActivities">Sub-activities</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-sub-activities"
          options={activityOptions}
          value={toComboboxItems(draft.subActivities)}
          onChange={selected =>
            onChange({
              ...draft,
              subActivities: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          disabled={disabled || (!processId && phaseId === undefined)}
          data-cy="activity-drawer-sub-activities"
        />
      </FormGroup>
    </div>
  );
};

export default DependenciesTab;
