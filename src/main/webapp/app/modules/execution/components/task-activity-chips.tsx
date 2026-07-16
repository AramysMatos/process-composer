import './task-activity-chips.scss';

import React from 'react';
import { Badge } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { IActivity } from 'app/shared/model/activity.model';
import { isTaskLinkedToActivity } from 'app/shared/util/task-stats.utils';
import { ITask } from 'app/shared/model/task.model';

export interface TaskActivityChipsProps {
  task: Pick<ITask, 'activities'>;
}

export const TaskActivityChips = ({ task }: TaskActivityChipsProps) => {
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
      {activities.map((activity: IActivity) => (
        <Badge key={activity.id} color="info" pill className="task-activity-chips__chip">
          {activity.name ?? `Activity ${activity.id}`}
        </Badge>
      ))}
    </div>
  );
};

export default TaskActivityChips;
