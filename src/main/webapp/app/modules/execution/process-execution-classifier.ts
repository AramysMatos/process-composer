import type { IActivity } from 'app/shared/model/activity.model';
import type { ITask } from 'app/shared/model/task.model';

export type ExecutionOperationType = 'link' | 'split' | 'merge' | 'add' | 'remove';

export interface ExecutionOperationItem {
  type: ExecutionOperationType;
  activities: Array<{ id: number; name: string }>;
  tasks: Array<{ id: number; name: string }>;
  nameMismatch?: boolean;
}

export interface ExecutionComparisonResult {
  items: ExecutionOperationItem[];
  counts: Record<ExecutionOperationType, number>;
}

// `activities` = todas as Activities do Processo de origem do Projeto.
// `tasks` = todas as Tasks do Projeto, cada uma já com `activities` (EntityRef[]) preenchido.
export function classifyProcessExecution(activities: IActivity[], tasks: ITask[]): ExecutionComparisonResult {
  const items: ExecutionOperationItem[] = [];

  // quantas Tasks cada Activity tem, para decidir Link vs Split
  const taskCountByActivity = new Map<number, ITask[]>();
  for (const task of tasks) {
    for (const ref of task.activities ?? []) {
      const list = taskCountByActivity.get(ref.id!) ?? [];
      list.push(task);
      taskCountByActivity.set(ref.id!, list);
    }
  }

  // classificação por Task: Add / Merge / (Link ou parte de um Split)
  const splitGroups = new Map<number, ITask[]>();
  for (const task of tasks) {
    const refs = task.activities ?? [];
    if (refs.length === 0) {
      items.push({ type: 'add', activities: [], tasks: [{ id: task.id!, name: task.name }] });
    } else if (refs.length >= 2) {
      items.push({
        type: 'merge',
        activities: refs.map(r => ({ id: r.id!, name: r.name })),
        tasks: [{ id: task.id!, name: task.name }],
      });
    } else {
      const activityId = refs[0].id!;
      const siblings = taskCountByActivity.get(activityId) ?? [];
      if (siblings.length >= 2) {
        const group = splitGroups.get(activityId) ?? [];
        group.push(task);
        splitGroups.set(activityId, group);
      } else {
        const activity = activities.find(a => a.id === activityId);
        items.push({
          type: 'link',
          activities: [{ id: activityId, name: refs[0].name }],
          tasks: [{ id: task.id!, name: task.name }],
          nameMismatch: activity ? activity.name !== task.name : false,
        });
      }
    }
  }

  // consolidar grupos de Split (1 Activity -> 2+ Tasks)
  for (const [activityId, groupTasks] of splitGroups) {
    const activity = activities.find(a => a.id === activityId);
    items.push({
      type: 'split',
      activities: [{ id: activityId, name: activity?.name ?? '' }],
      tasks: groupTasks.map(t => ({ id: t.id!, name: t.name })),
    });
  }

  // Remove: Activities do processo sem nenhuma Task vinculada
  for (const activity of activities) {
    if (!taskCountByActivity.has(activity.id!)) {
      items.push({ type: 'remove', activities: [{ id: activity.id!, name: activity.name }], tasks: [] });
    }
  }

  const counts = items.reduce((acc, item) => ({ ...acc, [item.type]: (acc[item.type] ?? 0) + 1 }), {
    link: 0,
    split: 0,
    merge: 0,
    add: 0,
    remove: 0,
  } as Record<ExecutionOperationType, number>);

  return { items, counts };
}
