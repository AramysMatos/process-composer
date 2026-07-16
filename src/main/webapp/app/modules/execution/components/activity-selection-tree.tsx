import './activity-selection-tree.scss';

import React, { useEffect, useRef, useState } from 'react';
import { Input, Label, Spinner } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { ActivitySelectionTreePhase, getPhaseSelectionState } from 'app/modules/execution/components/activity-selection-tree.utils';

export interface ActivitySelectionTreeProps {
  phases: ActivitySelectionTreePhase[];
  selectedActivityIds: number[];
  onChange: (selectedActivityIds: number[]) => void;
  loading?: boolean;
}

const PhaseCheckbox = ({
  phase,
  selectedActivityIds,
  onTogglePhase,
}: {
  phase: ActivitySelectionTreePhase;
  selectedActivityIds: Set<number>;
  onTogglePhase: (phase: ActivitySelectionTreePhase, checked: boolean) => void;
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const { checked, indeterminate } = getPhaseSelectionState(phase, selectedActivityIds);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <Input
      innerRef={checkboxRef}
      type="checkbox"
      id={`activity-tree-phase-${phase.id}`}
      checked={checked}
      onChange={event => onTogglePhase(phase, event.target.checked)}
      data-cy={`activityTreePhase-${phase.id}`}
    />
  );
};

export const ActivitySelectionTree = ({ phases, selectedActivityIds, onChange, loading = false }: ActivitySelectionTreeProps) => {
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<number>>(() => new Set(phases.map(phase => phase.id)));

  useEffect(() => {
    setExpandedPhaseIds(new Set(phases.map(phase => phase.id)));
  }, [phases]);

  const selectedIds = new Set(selectedActivityIds);

  const togglePhaseExpansion = (phaseId: number) => {
    setExpandedPhaseIds(current => {
      const next = new Set(current);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const togglePhase = (phase: ActivitySelectionTreePhase, checked: boolean) => {
    const phaseActivityIds = phase.activities.map(activity => activity.id);
    const next = new Set(selectedIds);

    if (checked) {
      phaseActivityIds.forEach(id => next.add(id));
    } else {
      phaseActivityIds.forEach(id => next.delete(id));
    }

    onChange(Array.from(next));
  };

  const toggleActivity = (activityId: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(activityId);
    } else {
      next.delete(activityId);
    }
    onChange(Array.from(next));
  };

  if (loading) {
    return (
      <div className="activity-selection-tree__empty" data-cy="activitySelectionTreeLoading">
        <Spinner size="sm" className="me-2" />
        <Translate contentKey="processComposerApp.execution.wizard.activitiesStep.loading">Loading activities...</Translate>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="activity-selection-tree__empty" data-cy="activitySelectionTreeEmpty">
        <Translate contentKey="processComposerApp.execution.wizard.activitiesStep.noActivities">
          This process has no phases or activities to select.
        </Translate>
      </div>
    );
  }

  return (
    <div className="activity-selection-tree" data-cy="activitySelectionTree">
      <div className="activity-selection-tree__list">
        {phases.map(phase => {
          const isExpanded = expandedPhaseIds.has(phase.id);

          return (
            <section key={phase.id} className="activity-selection-tree__phase">
              <div className="activity-selection-tree__phase-header">
                <button
                  type="button"
                  className="activity-selection-tree__phase-toggle"
                  onClick={() => togglePhaseExpansion(phase.id)}
                  aria-expanded={isExpanded}
                  aria-label={phase.name}
                  data-cy={`activityTreeTogglePhase-${phase.id}`}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
                <PhaseCheckbox phase={phase} selectedActivityIds={selectedIds} onTogglePhase={togglePhase} />
                <Label for={`activity-tree-phase-${phase.id}`} className="activity-selection-tree__phase-label">
                  {phase.name}
                  <span className="text-muted fw-normal ms-1">({phase.activities.length})</span>
                </Label>
              </div>

              {isExpanded && (
                <ul className="activity-selection-tree__activities">
                  {phase.activities.map(activity => (
                    <li key={activity.id} className="activity-selection-tree__activity">
                      <Input
                        type="checkbox"
                        id={`activity-tree-activity-${activity.id}`}
                        checked={selectedIds.has(activity.id)}
                        onChange={event => toggleActivity(activity.id, event.target.checked)}
                        data-cy={`activityTreeActivity-${activity.id}`}
                      />
                      <Label for={`activity-tree-activity-${activity.id}`} className="activity-selection-tree__activity-label">
                        {activity.name}
                      </Label>
                    </li>
                  ))}
                  {phase.activities.length === 0 && (
                    <li className="activity-selection-tree__empty">
                      <Translate contentKey="processComposerApp.execution.wizard.activitiesStep.emptyPhase">
                        No activities in this phase.
                      </Translate>
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ActivitySelectionTree;
