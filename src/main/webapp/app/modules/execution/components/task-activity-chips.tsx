import './task-activity-chips.scss';

import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { IActivity } from 'app/shared/model/activity.model';
import { buildProcessActivityLink } from 'app/modules/process-design/process-activity-link.utils';
import { isTaskLinkedToActivity } from 'app/shared/util/task-stats.utils';
import { ITask } from 'app/shared/model/task.model';

export interface TaskActivityChipsProps {
  task: Pick<ITask, 'activities'>;
  processId?: number;
}

export const TaskActivityChips = ({ task, processId }: TaskActivityChipsProps) => {
  const activities = task.activities ?? [];

  if (!isTaskLinkedToActivity(task)) {
    return (
      <Badge color="secondary" pill className="task-activity-chips__independent" data-cy="task-independent-badge">
        <Translate contentKey="processComposerApp.execution.tasks.independentBadge">Independent</Translate>
      </Badge>
    );
  }

  return (
    <div className="task-activity-chips" data-cy="task-activity-chips">
      {activities.map((activity: IActivity) => {
        const label = activity.name ?? `Activity ${activity.id}`;

        if (!activity.id || !processId) {
          return (
            <Badge key={activity.id ?? label} color="info" pill className="task-activity-chips__chip">
              {label}
            </Badge>
          );
        }

        return (
          <Badge
            key={activity.id}
            tag={Link}
            to={buildProcessActivityLink(processId, activity.id)}
            color="info"
            pill
            className="task-activity-chips__chip task-activity-chips__chip--link"
            data-cy={`task-activity-chip-${activity.id}`}
            aria-label={translate('processComposerApp.execution.tasks.viewActivity', { name: label })}
            onClick={event => event.stopPropagation()}
          >
            {label}
          </Badge>
        );
      })}
    </div>
  );
};

export default TaskActivityChips;
