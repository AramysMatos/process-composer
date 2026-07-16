import './task-detail-panel.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form, FormFeedback, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createTask, updateEntity as updateTask } from 'app/entities/task/task.reducer';
import { IssuePreviewList } from 'app/modules/execution/components/issue-preview-list';
import { TaskLinkedActivitiesAccordion } from 'app/modules/execution/components/task-linked-activities-accordion';
import { generateGithubIssuePreviews, GithubIssuePreview } from 'app/modules/execution/execution.reducer';
import { getActivityOptionsForProcess } from 'app/modules/execution/execution.utils';
import { ITask } from 'app/shared/model/task.model';
import { EntityComboboxCreatable, IEntityComboboxItem } from 'app/shared-ui/entity-combobox-creatable';

export type TaskDetailPanelMode = 'view' | 'edit';

export interface TaskDetailPanelProps {
  task: ITask | null;
  isCreating: boolean;
  projectId: number;
  processId?: number;
  githubConnected: boolean;
  mode: TaskDetailPanelMode;
  onModeChange: (mode: TaskDetailPanelMode) => void;
  onDelete: () => void;
  onCancelCreate: () => void;
  onTaskPublished?: () => void;
}

export const TaskDetailPanel = ({
  task,
  isCreating,
  projectId,
  processId,
  githubConnected,
  mode,
  onModeChange,
  onDelete,
  onCancelCreate,
  onTaskPublished,
}: TaskDetailPanelProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const phaseEntities = useAppSelector(state => state.phase.entities);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const taskUpdating = useAppSelector(state => state.task.updating);
  const executionLoading = useAppSelector(state => state.execution.loading);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<IEntityComboboxItem[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [issuePreviews, setIssuePreviews] = useState<GithubIssuePreview[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  const activityOptions = useMemo(
    () => getActivityOptionsForProcess(processId, phaseEntities, activityEntities),
    [activityEntities, phaseEntities, processId]
  );

  useEffect(() => {
    if (isCreating) {
      setName('');
      setDescription('');
      setSelectedActivities([]);
      setNameError(null);
      setSubmitError(null);
      return;
    }

    if (task) {
      setName(task.name ?? '');
      setDescription(task.description ?? '');
      setSelectedActivities(
        (task.activities ?? [])
          .filter(activity => activity.id !== undefined)
          .map(activity => ({
            id: activity.id as number,
            name: activity.name ?? `Activity ${activity.id}`,
          }))
      );
      setNameError(null);
      setSubmitError(null);
    }
  }, [isCreating, task]);

  useEffect(() => {
    setIssuePreviews([]);
    setPublishError(null);
  }, [task?.id]);

  const handlePublishGitHub = async () => {
    if (!task) {
      return;
    }

    if (!githubConnected) {
      navigate(`/projetos/${projectId}/github`);
      return;
    }

    setPublishError(null);

    try {
      const previews = await dispatch(generateGithubIssuePreviews([task])).unwrap();
      setIssuePreviews(previews);
    } catch (error: unknown) {
      const message =
        (error as Error)?.message ?? translate('processComposerApp.execution.github.generate.error', 'Failed to generate issue previews.');
      setPublishError(message);
      toast.error(message);
    }
  };

  const handlePublished = () => {
    setIssuePreviews([]);
    onTaskPublished?.();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNameError(null);
    setSubmitError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('processComposerApp.execution.tasks.createModal.validation.nameRequired');
      return;
    }

    const taskPayload: ITask = {
      ...(task?.id ? task : {}),
      name: trimmedName,
      description: description.trim() || null,
      project: { id: projectId },
      activities: selectedActivities.map(activity => ({ id: activity.id, name: activity.name })),
    };

    try {
      if (isCreating) {
        await dispatch(createTask(taskPayload)).unwrap();
      } else {
        await dispatch(updateTask(taskPayload)).unwrap();
      }
      onModeChange('view');
    } catch {
      setSubmitError(
        translate(
          isCreating
            ? 'processComposerApp.execution.tasks.createModal.submitError'
            : 'processComposerApp.execution.tasks.editModal.submitError',
          isCreating ? 'Could not create the task.' : 'Could not save the task.'
        )
      );
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      onCancelCreate();
      return;
    }
    onModeChange('view');
    if (task) {
      setName(task.name ?? '');
      setDescription(task.description ?? '');
      setSelectedActivities(
        (task.activities ?? [])
          .filter(activity => activity.id !== undefined)
          .map(activity => ({
            id: activity.id as number,
            name: activity.name ?? `Activity ${activity.id}`,
          }))
      );
    }
    setNameError(null);
    setSubmitError(null);
  };

  if (mode === 'edit' || isCreating) {
    return (
      <div className="task-detail-panel__body" data-cy={isCreating ? 'task-create-panel' : 'task-edit-panel'}>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
          <h2 className="h4 mb-0">
            {isCreating ? (
              <Translate contentKey="processComposerApp.execution.tasks.detailPanel.createTitle">New task</Translate>
            ) : (
              task?.name
            )}
          </h2>
        </div>

        <Form onSubmit={event => void handleSubmit(event)}>
          {submitError && (
            <Alert color="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          <FormGroup>
            <Label for="task-detail-name">
              <Translate contentKey="processComposerApp.task.name">Name</Translate>
            </Label>
            <Input
              id="task-detail-name"
              type="text"
              value={name}
              invalid={Boolean(nameError)}
              data-cy={isCreating ? 'createTaskName' : 'editTaskName'}
              onChange={event => {
                setName(event.target.value);
                if (nameError) {
                  setNameError(null);
                }
              }}
            />
            {nameError && (
              <FormFeedback>
                <Translate contentKey={nameError}>{nameError}</Translate>
              </FormFeedback>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="task-detail-description">
              <Translate contentKey="processComposerApp.task.description">Description</Translate>
            </Label>
            <Input
              id="task-detail-description"
              type="textarea"
              rows={3}
              value={description}
              data-cy={isCreating ? 'createTaskDescription' : 'editTaskDescription'}
              onChange={event => setDescription(event.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="task-detail-activities">
              <Translate contentKey="processComposerApp.execution.tasks.createModal.activitiesLabel">Linked activities</Translate>
            </Label>
            <p className="text-muted small mb-2">
              <Translate contentKey="processComposerApp.execution.tasks.createModal.activitiesHint">
                Optional. Select zero or more activities from the source process.
              </Translate>
            </p>
            <EntityComboboxCreatable
              id="task-detail-activities"
              options={activityOptions}
              value={selectedActivities}
              onChange={setSelectedActivities}
              placeholder={translate(
                'processComposerApp.execution.tasks.createModal.activitiesPlaceholder',
                'Search activities from the process...'
              )}
              data-cy={isCreating ? 'createTaskActivities' : 'editTaskActivities'}
            />
          </FormGroup>

          <div className="d-flex gap-2 flex-wrap">
            <Button type="submit" color="primary" disabled={taskUpdating} data-cy={isCreating ? 'createTaskSubmit' : 'editTaskSubmit'}>
              {taskUpdating ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {isCreating ? (
                    <Translate contentKey="processComposerApp.execution.tasks.createModal.creating">Creating...</Translate>
                  ) : (
                    <Translate contentKey="processComposerApp.execution.tasks.editModal.saving">Saving...</Translate>
                  )}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="save" className="me-1" />
                  {isCreating ? (
                    <Translate contentKey="processComposerApp.execution.tasks.createModal.confirm">Create task</Translate>
                  ) : (
                    <Translate contentKey="processComposerApp.execution.tasks.editModal.confirm">Save changes</Translate>
                  )}
                </>
              )}
            </Button>
            <Button type="button" color="secondary" outline onClick={handleCancel} disabled={taskUpdating}>
              <Translate contentKey="entity.action.cancel">Cancel</Translate>
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="task-detail-panel__body" data-cy="task-view-panel">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
        <h2 className="h4 mb-0">{task.name}</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            color="primary"
            outline
            size="sm"
            onClick={() => void handlePublishGitHub()}
            disabled={executionLoading}
            data-cy="task-publish-github-button"
          >
            {executionLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FontAwesomeIcon icon="cloud" className="me-1" />
                <Translate contentKey="processComposerApp.execution.tasks.detailPanel.publishGitHub">Publish on GitHub</Translate>
              </>
            )}
          </Button>
          <Button color="primary" size="sm" onClick={() => onModeChange('edit')} data-cy="task-edit-button">
            <FontAwesomeIcon icon="pencil-alt" className="me-1" />
            <Translate contentKey="processComposerApp.execution.tasks.detailPanel.edit">Edit</Translate>
          </Button>
          <Button color="danger" outline size="sm" onClick={onDelete} data-cy="task-delete-button">
            <FontAwesomeIcon icon="trash" className="me-1" />
            <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </div>
      </div>

      {task.gitHubUrl?.trim() && (
        <p className="text-muted small mb-3">
          <Translate contentKey="processComposerApp.execution.github.preview.alreadyPublished">Already published:</Translate>{' '}
          <a href={task.gitHubUrl} target="_blank" rel="noopener noreferrer">
            {task.gitHubUrl}
          </a>
        </p>
      )}

      <div className="task-detail-panel__field mb-3">
        <span className="task-detail-panel__label">
          <Translate contentKey="processComposerApp.task.name">Name</Translate>
        </span>
        <p className="task-detail-panel__value mb-0">{task.name ?? '—'}</p>
      </div>

      <div className="task-detail-panel__field mb-4">
        <span className="task-detail-panel__label">
          <Translate contentKey="processComposerApp.task.description">Description</Translate>
        </span>
        <p className="task-detail-panel__value mb-0">
          {task.description?.trim() || (
            <span className="text-muted">
              <Translate contentKey="processComposerApp.execution.tasks.detailPanel.noDescription">No description</Translate>
            </span>
          )}
        </p>
      </div>

      {publishError && (
        <Alert color="danger" className="mb-3" data-cy="task-publish-github-error">
          {publishError}
        </Alert>
      )}

      <div className="task-detail-panel__activities">
        <h3 className="h6 mb-3">
          <Translate contentKey="processComposerApp.execution.tasks.detailPanel.activities.title">Linked activities</Translate>
        </h3>
        <TaskLinkedActivitiesAccordion task={task} processId={processId} />
      </div>

      {issuePreviews.length > 0 && task && (
        <IssuePreviewList previews={issuePreviews} projectId={projectId} tasks={[task]} onPublished={handlePublished} />
      )}
    </div>
  );
};

export default TaskDetailPanel;
