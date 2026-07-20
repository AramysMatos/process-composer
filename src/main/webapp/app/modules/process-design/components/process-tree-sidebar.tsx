import './process-tree-sidebar.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity as getProcessEntity } from 'app/entities/process/process.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { EntityDeleteButton } from 'app/modules/process-design/components/entity-delete-button';
import { EntityEditButton } from 'app/modules/process-design/components/entity-edit-button';

export interface ProcessTreeSidebarProps {
  processId: number;
  onSelectActivity: (activityId: number) => void;
  onCreateActivity: (phaseId: number) => void;
  onCreatePhase: () => void;
  onEditPhase?: (phaseId: number) => void;
  onDeletePhase?: (phaseId: number, name: string, activityCount: number) => void;
  onDeleteActivity?: (activityId: number, name: string) => void;
  selectedActivityId?: number;
}

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const sortActivities = (activities: IActivity[]): IActivity[] =>
  [...activities].sort((left, right) => {
    const nameCompare = (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return (left.id ?? 0) - (right.id ?? 0);
  });

export const ProcessTreeSidebar = ({
  processId,
  onSelectActivity,
  onCreateActivity,
  onCreatePhase,
  onEditPhase,
  onDeletePhase,
  onDeleteActivity,
  selectedActivityId,
}: ProcessTreeSidebarProps) => {
  const dispatch = useAppDispatch();

  const process = useAppSelector(state => state.process.entity);
  const processLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);

  const [processExpanded, setProcessExpanded] = useState(true);
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<number>>(() => new Set());
  const expansionInitializedRef = useRef(false);
  const previousPhaseIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    expansionInitializedRef.current = false;
    previousPhaseIdsRef.current = new Set();
    setProcessExpanded(true);
    setExpandedPhaseIds(new Set());
  }, [processId]);

  useEffect(() => {
    dispatch(getProcessEntity(processId));
    dispatch(getPhaseEntities({}));
    dispatch(getActivityEntities({ eagerload: true }));
  }, [dispatch, processId]);

  const phases = useMemo(() => sortById(phaseEntities.filter(phase => phase.process?.id === processId)), [phaseEntities, processId]);

  const phaseIds = useMemo((): number[] => phases.flatMap(phase => (phase.id !== undefined ? [phase.id] : [])), [phases]);

  const activitiesByPhaseId = useMemo(() => {
    const grouped = new Map<number, IActivity[]>();

    phases.forEach(phase => {
      if (!phase.id) {
        return;
      }

      const phaseActivities = sortActivities(activityEntities.filter(activity => activity.phase?.id === phase.id));
      grouped.set(phase.id, phaseActivities);
    });

    return grouped;
  }, [activityEntities, phases]);

  useEffect(() => {
    if (expansionInitializedRef.current || phases.length === 0) {
      return;
    }

    const firstPhaseId = phases.find(phase => phase.id !== undefined)?.id;
    setExpandedPhaseIds(firstPhaseId !== undefined ? new Set([firstPhaseId]) : new Set());
    expansionInitializedRef.current = true;
  }, [phases]);

  useEffect(() => {
    const currentPhaseIds = new Set(phases.map(phase => phase.id).filter((id): id is number => id !== undefined));
    const previousPhaseIds = previousPhaseIdsRef.current;
    const newPhaseIds = [...currentPhaseIds].filter(id => !previousPhaseIds.has(id));

    if (newPhaseIds.length > 0) {
      setExpandedPhaseIds(current => {
        const next = new Set(current);
        newPhaseIds.forEach(id => next.add(id));
        return next;
      });
    }

    previousPhaseIdsRef.current = currentPhaseIds;
  }, [phases]);

  const loading = processLoading || phaseLoading || activityLoading;
  const processLabel = process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process');
  const processMatches = process.id === processId;

  const togglePhaseExpanded = (phaseId: number) => {
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

  const expandAllPhases = () => {
    setExpandedPhaseIds(new Set(phaseIds));
  };

  const collapseAllPhases = () => {
    setExpandedPhaseIds(new Set());
  };

  const allPhasesExpanded = phaseIds.length > 0 && phaseIds.every(phaseId => expandedPhaseIds.has(phaseId));
  const allPhasesCollapsed = phaseIds.every(phaseId => !expandedPhaseIds.has(phaseId));
  const expandAllPhasesLabel = translate('processComposerApp.processDesign.tree.expandAllPhases', 'Expand phases');
  const collapseAllPhasesLabel = translate('processComposerApp.processDesign.tree.collapseAllPhases', 'Collapse phases');

  const renderPhaseNode = (phase: IPhase) => {
    if (!phase.id) {
      return null;
    }

    const phaseExpanded = expandedPhaseIds.has(phase.id);
    const phaseActivities = activitiesByPhaseId.get(phase.id) ?? [];

    return (
      <li key={phase.id} className="process-tree-sidebar__node" role="treeitem" aria-expanded={phaseExpanded}>
        <div className="process-tree-sidebar__row">
          <button
            type="button"
            className="process-tree-sidebar__toggle"
            onClick={() => togglePhaseExpanded(phase.id as number)}
            aria-label={
              phaseExpanded
                ? translate('processComposerApp.processDesign.tree.collapsePhase', 'Collapse phase')
                : translate('processComposerApp.processDesign.tree.expandPhase', 'Expand phase')
            }
          >
            <FontAwesomeIcon icon={phaseExpanded ? 'chevron-down' : 'chevron-right'} />
          </button>
          <button
            type="button"
            className="process-tree-sidebar__label process-tree-sidebar__label--branch"
            onClick={() => togglePhaseExpanded(phase.id as number)}
          >
            <FontAwesomeIcon icon="layer-group" className="process-tree-sidebar__icon" />
            <span className="process-tree-sidebar__label-text">{phase.name}</span>
          </button>
          {(onEditPhase || onDeletePhase) && (
            <div className="process-tree-sidebar__row-actions">
              {onEditPhase && (
                <EntityEditButton
                  label={translate('processComposerApp.processDesign.edit.editPhase', 'Edit phase')}
                  onClick={() => onEditPhase(phase.id as number)}
                  data-cy={`sidebar-edit-phase-${phase.id}`}
                />
              )}
              {onDeletePhase && (
                <EntityDeleteButton
                  label={translate('processComposerApp.processDesign.delete.deletePhase', 'Delete phase')}
                  onClick={() => onDeletePhase(phase.id as number, phase.name ?? '', phaseActivities.length)}
                  data-cy={`sidebar-delete-phase-${phase.id}`}
                />
              )}
            </div>
          )}
        </div>

        {phaseExpanded && (
          <ul className="process-tree-sidebar__children" role="group">
            {phaseActivities.length === 0 && (
              <li className="process-tree-sidebar__empty">
                <Translate contentKey="processComposerApp.processDesign.tree.noActivities">No activities yet</Translate>
              </li>
            )}

            {phaseActivities.map(activity => {
              if (!activity.id) {
                return null;
              }

              const isSelected = selectedActivityId === activity.id;

              return (
                <li key={activity.id} className="process-tree-sidebar__node" role="treeitem">
                  <div className={`process-tree-sidebar__row${isSelected ? ' process-tree-sidebar__row--selected' : ''}`}>
                    <span className="process-tree-sidebar__toggle process-tree-sidebar__toggle--placeholder" aria-hidden="true" />
                    <button
                      type="button"
                      className="process-tree-sidebar__label process-tree-sidebar__label--leaf"
                      onClick={() => onSelectActivity(activity.id as number)}
                    >
                      <FontAwesomeIcon icon="circle" className="process-tree-sidebar__icon" />
                      <span className="process-tree-sidebar__label-text">{activity.name}</span>
                    </button>
                    {onDeleteActivity && (
                      <div className="process-tree-sidebar__row-actions">
                        <EntityDeleteButton
                          label={translate('processComposerApp.processDesign.delete.deleteActivity', 'Delete activity')}
                          onClick={() => onDeleteActivity(activity.id as number, activity.name ?? '')}
                          data-cy={`sidebar-delete-activity-${activity.id}`}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}

            <li>
              <button type="button" className="process-tree-sidebar__create" onClick={() => onCreateActivity(phase.id as number)}>
                <FontAwesomeIcon icon="plus" />
                <Translate contentKey="processComposerApp.processDesign.tree.newActivity">New activity</Translate>
              </button>
            </li>
          </ul>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="process-tree-sidebar" data-cy="process-tree-sidebar">
        <div className="process-tree-sidebar__loading">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (!processMatches) {
    return (
      <div className="process-tree-sidebar" data-cy="process-tree-sidebar">
        <Alert color="warning">
          <Translate contentKey="processComposerApp.processDesign.tree.processNotFound">Process not found</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <nav
      className="process-tree-sidebar"
      aria-label={translate('processComposerApp.processDesign.tree.ariaLabel', 'Process structure')}
      data-cy="process-tree-sidebar"
    >
      <ul className="process-tree-sidebar__tree" role="tree">
        <li className="process-tree-sidebar__node" role="treeitem" aria-expanded={processExpanded}>
          <div className="process-tree-sidebar__row">
            <button
              type="button"
              className="process-tree-sidebar__toggle"
              onClick={() => setProcessExpanded(current => !current)}
              aria-label={
                processExpanded
                  ? translate('processComposerApp.processDesign.tree.collapseProcess', 'Collapse process')
                  : translate('processComposerApp.processDesign.tree.expandProcess', 'Expand process')
              }
            >
              <FontAwesomeIcon icon={processExpanded ? 'chevron-down' : 'chevron-right'} />
            </button>
            <button
              type="button"
              className="process-tree-sidebar__label process-tree-sidebar__label--branch process-tree-sidebar__label--process"
              onClick={() => setProcessExpanded(current => !current)}
            >
              <FontAwesomeIcon icon="sitemap" className="process-tree-sidebar__icon" />
              <span className="process-tree-sidebar__label-text">{processLabel}</span>
            </button>
            {phases.length > 0 && (
              <div className="process-tree-sidebar__phases-toolbar">
                <button
                  type="button"
                  className="process-tree-sidebar__phases-action"
                  onClick={expandAllPhases}
                  disabled={allPhasesExpanded}
                  title={expandAllPhasesLabel}
                  aria-label={expandAllPhasesLabel}
                  data-cy="sidebar-expand-all-phases"
                >
                  <FontAwesomeIcon icon="angles-down" />
                </button>
                <button
                  type="button"
                  className="process-tree-sidebar__phases-action"
                  onClick={collapseAllPhases}
                  disabled={allPhasesCollapsed}
                  title={collapseAllPhasesLabel}
                  aria-label={collapseAllPhasesLabel}
                  data-cy="sidebar-collapse-all-phases"
                >
                  <FontAwesomeIcon icon="angles-up" />
                </button>
              </div>
            )}
          </div>

          {processExpanded && (
            <ul className="process-tree-sidebar__children" role="group">
              {phases.length === 0 && (
                <li className="process-tree-sidebar__empty">
                  <Translate contentKey="processComposerApp.processDesign.tree.noPhases">No phases defined yet</Translate>
                </li>
              )}

              {phases.map(renderPhaseNode)}

              <li>
                <button type="button" className="process-tree-sidebar__create" onClick={onCreatePhase}>
                  <FontAwesomeIcon icon="plus" />
                  <Translate contentKey="processComposerApp.processDesign.tree.newPhase">New phase</Translate>
                </button>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default ProcessTreeSidebar;
