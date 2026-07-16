import './task-linked-activities-accordion.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Collapse, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { useStore } from 'react-redux';

import { IRootState, useAppDispatch } from 'app/config/store';
import { resolveActivity } from 'app/modules/execution/execution.utils';
import { buildProcessActivityLink } from 'app/modules/process-design/process-activity-link.utils';
import { IActivity } from 'app/shared/model/activity.model';
import { isTaskLinkedToActivity } from 'app/shared/util/task-stats.utils';
import { ITask } from 'app/shared/model/task.model';

interface NamedItem {
  name?: string | null;
  description?: string | null;
}

export interface TaskLinkedActivitiesAccordionProps {
  task: Pick<ITask, 'activities'>;
  processId?: number;
}

function formatNamedList(items: NamedItem[] | null | undefined, emptyLabel: string): React.ReactNode {
  const named = (items ?? []).filter(item => item.name?.trim());
  if (named.length === 0) {
    return <span className="task-linked-activities-accordion__empty">{emptyLabel}</span>;
  }

  return (
    <ul className="task-linked-activities-accordion__list mb-0">
      {named.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          <strong>{item.name}</strong>
          {item.description?.trim() ? `: ${item.description.trim()}` : null}
        </li>
      ))}
    </ul>
  );
}

function formatRoles(roles: NamedItem[] | null | undefined, emptyLabel: string): React.ReactNode {
  const names = (roles ?? []).map(role => role.name?.trim()).filter((name): name is string => Boolean(name));
  if (names.length === 0) {
    return <span className="task-linked-activities-accordion__empty">{emptyLabel}</span>;
  }
  return <p className="task-linked-activities-accordion__value mb-0">{names.join(', ')}</p>;
}

interface ActivityAccordionItemProps {
  activity: IActivity;
  processId?: number;
  expanded: boolean;
  onToggle: () => void;
}

const ActivityAccordionItem = ({ activity, processId, expanded, onToggle }: ActivityAccordionItemProps) => {
  const dispatch = useAppDispatch();
  const store = useStore<IRootState>();

  const [hydratedActivity, setHydratedActivity] = useState<IActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const label = activity.name ?? `Activity ${activity.id}`;
  const activityLink = activity.id && processId ? buildProcessActivityLink(processId, activity.id) : undefined;

  useEffect(() => {
    setHydratedActivity(null);
    setLoadError(false);
  }, [activity.id]);

  useEffect(() => {
    if (!expanded || !activity.id) {
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const resolved = await resolveActivity(activity, dispatch, store.getState);
        if (!cancelled) {
          setHydratedActivity(resolved);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [activity, dispatch, expanded, store]);

  const details = hydratedActivity ?? activity;

  return (
    <div className="task-linked-activities-accordion__item" data-cy={`task-activity-item-${activity.id}`}>
      <button
        type="button"
        className="task-linked-activities-accordion__header"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={
          expanded
            ? translate('processComposerApp.execution.tasks.detailPanel.activities.collapse', 'Recolher atividade')
            : translate('processComposerApp.execution.tasks.detailPanel.activities.expand', 'Expandir atividade')
        }
      >
        <span className="task-linked-activities-accordion__name">
          {activityLink ? (
            <Link to={activityLink} onClick={event => event.stopPropagation()} data-cy={`task-activity-link-${activity.id}`}>
              {label}
            </Link>
          ) : (
            label
          )}
        </span>
        <FontAwesomeIcon icon={expanded ? 'chevron-up' : 'chevron-down'} aria-hidden="true" />
      </button>

      <Collapse isOpen={expanded}>
        <div className="task-linked-activities-accordion__body">
          {loading && (
            <div className="text-center py-2">
              <Spinner size="sm" color="primary" />
            </div>
          )}

          {loadError && (
            <p className="text-danger small mb-0">
              <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.loadError">
                Could not load activity details.
              </Translate>
            </p>
          )}

          {!loading && !loadError && (
            <>
              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.task.description">Description</Translate>
                </span>
                <p className="task-linked-activities-accordion__value">
                  {details.description?.trim() || <span className="task-linked-activities-accordion__empty">—</span>}
                </p>
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.responsibleRoles">
                    Responsible roles
                  </Translate>
                </span>
                {formatRoles(details.responsibleRoles, translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None'))}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.participantRoles">
                    Participant roles
                  </Translate>
                </span>
                {formatRoles(details.participantRoles, translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None'))}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.tools">Tools</Translate>
                </span>
                {formatNamedList(details.tools, translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None'))}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.guidelines">Guidelines</Translate>
                </span>
                {formatNamedList(details.guidelines, translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None'))}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.templates">Templates</Translate>
                </span>
                {formatNamedList(details.templates, translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None'))}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.requiredArtifacts">
                    Required artifacts
                  </Translate>
                </span>
                {formatNamedList(
                  details.requiredArtifacts,
                  translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None')
                )}
              </div>

              <div className="task-linked-activities-accordion__field">
                <span className="task-linked-activities-accordion__label">
                  <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.producedArtifacts">
                    Produced artifacts
                  </Translate>
                </span>
                {formatNamedList(
                  details.producedArtifacts,
                  translate('processComposerApp.execution.tasks.detailPanel.activities.none', 'None')
                )}
              </div>
            </>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export const TaskLinkedActivitiesAccordion = ({ task, processId }: TaskLinkedActivitiesAccordionProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpanded = useCallback((activityId: number) => {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }
      return next;
    });
  }, []);

  if (!isTaskLinkedToActivity(task)) {
    return (
      <Badge color="secondary" pill data-cy="task-independent-badge">
        <Translate contentKey="processComposerApp.execution.tasks.independentBadge">Independent</Translate>
      </Badge>
    );
  }

  const activities = task.activities ?? [];

  return (
    <div className="task-linked-activities-accordion" data-cy="task-linked-activities-accordion">
      {activities.map(activity => {
        if (!activity.id) {
          return null;
        }

        return (
          <ActivityAccordionItem
            key={activity.id}
            activity={activity}
            processId={processId}
            expanded={expandedIds.has(activity.id)}
            onToggle={() => toggleExpanded(activity.id as number)}
          />
        );
      })}
    </div>
  );
};

export default TaskLinkedActivitiesAccordion;
