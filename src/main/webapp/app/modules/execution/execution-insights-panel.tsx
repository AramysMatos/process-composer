import './execution-insights-panel.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Collapse, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import {
  classifyProcessExecution,
  ExecutionOperationItem,
  ExecutionOperationType,
} from 'app/modules/execution/process-execution-classifier';
import { filterActivitiesByProcess } from 'app/modules/execution/execution.utils';
import { buildProcessActivityLink } from 'app/modules/process-design/process-activity-link.utils';

const CATEGORY_ORDER: ExecutionOperationType[] = ['link', 'split', 'merge', 'add', 'remove'];

interface CategoryVisual {
  icon: IconProp;
  tone: 'primary' | 'neutral' | 'warning';
  labelKey: string;
  defaultLabel: string;
  hintKey: string;
  defaultHint: string;
}

const CATEGORY_VISUALS: Record<ExecutionOperationType, CategoryVisual> = {
  link: {
    icon: 'link',
    tone: 'primary',
    labelKey: 'processComposerApp.execution.insights.categories.link',
    defaultLabel: 'Link',
    hintKey: 'processComposerApp.execution.insights.categories.linkHint',
    defaultHint: '1 activity → 1 task',
  },
  split: {
    icon: 'code-branch',
    tone: 'primary',
    labelKey: 'processComposerApp.execution.insights.categories.split',
    defaultLabel: 'Split',
    hintKey: 'processComposerApp.execution.insights.categories.splitHint',
    defaultHint: '1 activity → N tasks',
  },
  merge: {
    icon: 'object-group',
    tone: 'primary',
    labelKey: 'processComposerApp.execution.insights.categories.merge',
    defaultLabel: 'Merge',
    hintKey: 'processComposerApp.execution.insights.categories.mergeHint',
    defaultHint: 'N activities → 1 task',
  },
  add: {
    icon: 'plus-circle',
    tone: 'neutral',
    labelKey: 'processComposerApp.execution.insights.categories.add',
    defaultLabel: 'Add',
    hintKey: 'processComposerApp.execution.insights.categories.addHint',
    defaultHint: 'Task without activity',
  },
  remove: {
    icon: 'exclamation-triangle',
    tone: 'warning',
    labelKey: 'processComposerApp.execution.insights.categories.remove',
    defaultLabel: 'Remove',
    hintKey: 'processComposerApp.execution.insights.categories.removeHint',
    defaultHint: 'Activity without task',
  },
};

export interface ExecutionInsightsPanelProps {
  projectId: number;
  processId?: number;
}

const InsightsSectionHeader = () => (
  <header className="execution-insights-panel__header">
    <h2 className="execution-insights-panel__title h4 mb-1">
      <Translate contentKey="processComposerApp.execution.insights.title">Instantiation operations</Translate>
    </h2>
    <p className="execution-insights-panel__subtitle mb-0">
      <Translate contentKey="processComposerApp.execution.insights.subtitle">
        Comparison between the planned process and project execution, classified as Link, Split, Merge, Add and Remove.
      </Translate>
    </p>
  </header>
);

function buildTaskLink(projectId: number, taskId: number): string {
  return `/projetos/${projectId}/tarefas?task=${taskId}`;
}

interface CategoryItemRowProps {
  item: ExecutionOperationItem;
  projectId: number;
  processId?: number;
}

const CategoryItemRow = ({ item, projectId, processId }: CategoryItemRowProps) => {
  const activity = item.activities[0];
  const task = item.tasks[0];

  if (item.type === 'link' && activity && task) {
    const activityLink = processId ? buildProcessActivityLink(processId, activity.id) : undefined;

    return (
      <li className="execution-insights-panel__item" data-cy={`insights-item-link-${task.id}`}>
        <div className="execution-insights-panel__mapping">
          {activityLink ? (
            <Link to={activityLink} className="execution-insights-panel__entity-link" data-cy={`insights-activity-link-${activity.id}`}>
              {activity.name}
            </Link>
          ) : (
            <span className="execution-insights-panel__entity-name">{activity.name}</span>
          )}
          <FontAwesomeIcon icon="arrow-right" className="execution-insights-panel__arrow" aria-hidden="true" />
          <Link
            to={buildTaskLink(projectId, task.id)}
            className="execution-insights-panel__entity-link"
            data-cy={`insights-task-link-${task.id}`}
          >
            {task.name}
          </Link>
        </div>
        {item.nameMismatch && (
          <p className="execution-insights-panel__name-mismatch mb-0" data-cy={`insights-name-mismatch-${task.id}`}>
            <FontAwesomeIcon icon="exclamation-triangle" aria-hidden="true" />
            <Translate contentKey="processComposerApp.execution.insights.nameMismatch">
              Task name differs from the linked activity name
            </Translate>
          </p>
        )}
      </li>
    );
  }

  if (item.type === 'split' && activity) {
    const activityLink = processId ? buildProcessActivityLink(processId, activity.id) : undefined;

    return (
      <li className="execution-insights-panel__item" data-cy={`insights-item-split-${activity.id}`}>
        <div className="execution-insights-panel__mapping">
          {activityLink ? (
            <Link to={activityLink} className="execution-insights-panel__entity-link" data-cy={`insights-activity-link-${activity.id}`}>
              {activity.name}
            </Link>
          ) : (
            <span className="execution-insights-panel__entity-name">{activity.name}</span>
          )}
        </div>
        <ul className="execution-insights-panel__task-list">
          {item.tasks.map(splitTask => (
            <li key={splitTask.id}>
              <Link
                to={buildTaskLink(projectId, splitTask.id)}
                className="execution-insights-panel__entity-link"
                data-cy={`insights-task-link-${splitTask.id}`}
              >
                {splitTask.name}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  if (item.type === 'merge' && task) {
    return (
      <li className="execution-insights-panel__item" data-cy={`insights-item-merge-${task.id}`}>
        <ul className="execution-insights-panel__activity-list">
          {item.activities.map(mergedActivity => {
            const activityLink = processId ? buildProcessActivityLink(processId, mergedActivity.id) : undefined;

            return (
              <li key={mergedActivity.id}>
                {activityLink ? (
                  <Link
                    to={activityLink}
                    className="execution-insights-panel__entity-link"
                    data-cy={`insights-activity-link-${mergedActivity.id}`}
                  >
                    {mergedActivity.name}
                  </Link>
                ) : (
                  <span className="execution-insights-panel__entity-name">{mergedActivity.name}</span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="execution-insights-panel__mapping">
          <FontAwesomeIcon icon="arrow-right" className="execution-insights-panel__arrow" aria-hidden="true" />
          <Link
            to={buildTaskLink(projectId, task.id)}
            className="execution-insights-panel__entity-link"
            data-cy={`insights-task-link-${task.id}`}
          >
            {task.name}
          </Link>
        </div>
      </li>
    );
  }

  if (item.type === 'add' && task) {
    return (
      <li className="execution-insights-panel__item" data-cy={`insights-item-add-${task.id}`}>
        <Link
          to={buildTaskLink(projectId, task.id)}
          className="execution-insights-panel__entity-link"
          data-cy={`insights-task-link-${task.id}`}
        >
          {task.name}
        </Link>
      </li>
    );
  }

  if (item.type === 'remove' && activity) {
    const activityLink = processId ? buildProcessActivityLink(processId, activity.id) : undefined;

    return (
      <li className="execution-insights-panel__item" data-cy={`insights-item-remove-${activity.id}`}>
        {activityLink ? (
          <Link to={activityLink} className="execution-insights-panel__entity-link" data-cy={`insights-activity-link-${activity.id}`}>
            {activity.name}
          </Link>
        ) : (
          <span className="execution-insights-panel__entity-name">{activity.name}</span>
        )}
      </li>
    );
  }

  return null;
};

interface CategoryAccordionProps {
  type: ExecutionOperationType;
  items: ExecutionOperationItem[];
  count: number;
  projectId: number;
  processId?: number;
  expanded: boolean;
  onToggle: () => void;
}

const CategoryAccordion = ({ type, items, count, projectId, processId, expanded, onToggle }: CategoryAccordionProps) => {
  const visual = CATEGORY_VISUALS[type];
  const panelId = `execution-insights-${type}`;

  return (
    <div className="execution-insights-panel__category" data-cy={`insights-category-${type}`}>
      <button
        type="button"
        className="execution-insights-panel__category-header"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className="execution-insights-panel__category-title">
          <FontAwesomeIcon icon={expanded ? 'chevron-down' : 'chevron-right'} className="text-muted" aria-hidden="true" />
          <FontAwesomeIcon
            icon={visual.icon}
            className={`text-${visual.tone === 'warning' ? 'warning' : visual.tone === 'primary' ? 'primary' : 'secondary'}`}
            aria-hidden="true"
          />
          <Translate contentKey={visual.labelKey}>{visual.defaultLabel}</Translate>
        </span>
        <span className="execution-insights-panel__category-count">{count}</span>
      </button>

      <Collapse isOpen={expanded}>
        <div id={panelId} className="execution-insights-panel__category-body">
          {items.length === 0 ? (
            <p className="execution-insights-panel__empty mb-0">
              <Translate contentKey="processComposerApp.execution.insights.emptyCategory">No items in this category</Translate>
            </p>
          ) : (
            <ul className="execution-insights-panel__item-list">
              {items.map((item, index) => (
                <CategoryItemRow key={`${type}-${index}`} item={item} projectId={projectId} processId={processId} />
              ))}
            </ul>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export const ExecutionInsightsPanel = ({ projectId, processId }: ExecutionInsightsPanelProps) => {
  const dispatch = useAppDispatch();

  const phaseEntities = useAppSelector(state => state.phase.entities);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const taskEntities = useAppSelector(state => state.task.entities);
  const phasesLoading = useAppSelector(state => state.phase.loading);
  const activitiesLoading = useAppSelector(state => state.activity.loading);

  const [expandedCategories, setExpandedCategories] = useState<Set<ExecutionOperationType>>(new Set());

  useEffect(() => {
    if (!processId) {
      return;
    }

    dispatch(getPhases({}));
    dispatch(getActivities({}));
  }, [dispatch, processId]);

  const projectTasks = useMemo(() => taskEntities.filter(task => task.project?.id === projectId), [projectId, taskEntities]);

  const processActivities = useMemo(
    () => filterActivitiesByProcess(processId, phaseEntities, activityEntities),
    [activityEntities, phaseEntities, processId]
  );

  const comparison = useMemo(() => classifyProcessExecution(processActivities, projectTasks), [processActivities, projectTasks]);

  const itemsByType = useMemo(() => {
    const grouped = Object.fromEntries(CATEGORY_ORDER.map(type => [type, [] as ExecutionOperationItem[]])) as Record<
      ExecutionOperationType,
      ExecutionOperationItem[]
    >;

    for (const item of comparison.items) {
      grouped[item.type].push(item);
    }

    return grouped;
  }, [comparison.items]);

  const toggleCategory = useCallback((type: ExecutionOperationType) => {
    setExpandedCategories(current => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const loading = Boolean(processId) && (phasesLoading || activitiesLoading);

  if (!processId) {
    return (
      <section className="execution-insights-panel" data-cy="execution-insights-panel">
        <InsightsSectionHeader />
        <Alert color="info" className="mb-0" data-cy="execution-insights-no-process">
          <Translate contentKey="processComposerApp.execution.insights.noSourceProcess">
            This project has no source process to compare against.
          </Translate>
        </Alert>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="execution-insights-panel" data-cy="execution-insights-panel">
        <InsightsSectionHeader />
        <div className="execution-insights-panel__loading" data-cy="execution-insights-loading">
          <Spinner color="primary" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="execution-insights-panel"
      aria-label={translate('processComposerApp.execution.insights.ariaLabel', 'Execution insights')}
      data-cy="execution-insights-panel"
    >
      <InsightsSectionHeader />
      <div
        className="execution-insights-panel__stats"
        aria-label={translate('processComposerApp.execution.insights.statsAria', 'Execution classification summary')}
      >
        {CATEGORY_ORDER.map(type => {
          const visual = CATEGORY_VISUALS[type];
          const count = comparison.counts[type];

          return (
            <div
              key={type}
              className={`execution-insights-panel__stat-card execution-insights-panel__stat-card--${visual.tone}`}
              data-cy={`insights-stat-${type}`}
            >
              <span className={`execution-insights-panel__stat-value execution-insights-panel__stat-value--${visual.tone}`}>{count}</span>
              <span className="execution-insights-panel__stat-label">
                <Translate contentKey={visual.labelKey}>{visual.defaultLabel}</Translate>
              </span>
              <span className={`execution-insights-panel__stat-hint execution-insights-panel__stat-hint--${visual.tone}`}>
                <Translate contentKey={visual.hintKey}>{visual.defaultHint}</Translate>
              </span>
            </div>
          );
        })}
      </div>

      <div className="execution-insights-panel__accordion" data-cy="execution-insights-accordion">
        {CATEGORY_ORDER.map(type => (
          <CategoryAccordion
            key={type}
            type={type}
            items={itemsByType[type]}
            count={comparison.counts[type]}
            projectId={projectId}
            processId={processId}
            expanded={expandedCategories.has(type)}
            onToggle={() => toggleCategory(type)}
          />
        ))}
      </div>
    </section>
  );
};

export default ExecutionInsightsPanel;
