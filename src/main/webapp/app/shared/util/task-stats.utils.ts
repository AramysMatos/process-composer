import { ITask } from 'app/shared/model/task.model';

export type TaskOriginType = 'processo' | 'independente';

export interface IProjectTaskStats {
  total: number;
  linkedToActivity: number;
  independent: number;
}

/** Uma task é "vinculada ao processo" quando tem ao menos uma Activity associada. */
export const getTaskOrigin = (task: ITask): TaskOriginType => ((task.activities?.length ?? 0) > 0 ? 'processo' : 'independente');

export const isTaskLinkedToActivity = (task: ITask): boolean => getTaskOrigin(task) === 'processo';

export const countProjectTaskStats = (tasks: ITask[]): IProjectTaskStats => {
  const linkedToActivity = tasks.filter(isTaskLinkedToActivity).length;

  return {
    total: tasks.length,
    linkedToActivity,
    independent: tasks.length - linkedToActivity,
  };
};
