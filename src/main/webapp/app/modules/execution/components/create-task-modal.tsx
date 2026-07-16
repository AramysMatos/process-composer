import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createTask, updateEntity as updateTask } from 'app/entities/task/task.reducer';
import { getActivityOptionsForProcess } from 'app/modules/execution/execution.utils';
import { ITask } from 'app/shared/model/task.model';
import { EntityComboboxCreatable, IEntityComboboxItem } from 'app/shared-ui/entity-combobox-creatable';

export interface CreateTaskModalProps {
  isOpen: boolean;
  projectId: number;
  processId?: number;
  task?: ITask;
  onClose: () => void;
  onSaved?: () => void;
}

export const CreateTaskModal = ({ isOpen, projectId, processId, task, onClose, onSaved }: CreateTaskModalProps) => {
  const dispatch = useAppDispatch();

  const phaseEntities = useAppSelector(state => state.phase.entities);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const taskUpdating = useAppSelector(state => state.task.updating);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<IEntityComboboxItem[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = task?.id !== undefined;

  const activityOptions = useMemo(
    () => getActivityOptionsForProcess(processId, phaseEntities, activityEntities),
    [activityEntities, phaseEntities, processId]
  );

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSelectedActivities([]);
      setNameError(null);
      setSubmitError(null);
      return;
    }

    if (isEditMode && task) {
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
  }, [isEditMode, isOpen, task]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNameError(null);
    setSubmitError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('processComposerApp.execution.tasks.createModal.validation.nameRequired');
      return;
    }

    try {
      const taskPayload: ITask = {
        ...(isEditMode && task ? task : {}),
        name: trimmedName,
        description: description.trim() || null,
        project: { id: projectId },
        activities: selectedActivities.map(activity => ({ id: activity.id, name: activity.name })),
      };

      if (isEditMode) {
        await dispatch(updateTask(taskPayload)).unwrap();
      } else {
        await dispatch(createTask(taskPayload)).unwrap();
      }

      onSaved?.();
      onClose();
    } catch {
      setSubmitError(
        translate(
          isEditMode
            ? 'processComposerApp.execution.tasks.editModal.submitError'
            : 'processComposerApp.execution.tasks.createModal.submitError',
          isEditMode ? 'Could not save the task.' : 'Could not create the task.'
        )
      );
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" data-cy={isEditMode ? 'edit-task-modal' : 'create-task-modal'}>
      <Form onSubmit={event => void handleSubmit(event)}>
        <ModalHeader toggle={onClose}>
          {isEditMode ? (
            <Translate contentKey="processComposerApp.execution.tasks.editModal.title">Edit task</Translate>
          ) : (
            <Translate contentKey="processComposerApp.execution.tasks.createModal.title">New task</Translate>
          )}
        </ModalHeader>
        <ModalBody>
          {submitError && (
            <Alert color="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          <div className="mb-3">
            <Label for="task-name">
              <Translate contentKey="processComposerApp.task.name">Name</Translate>
            </Label>
            <Input
              id="task-name"
              type="text"
              value={name}
              invalid={Boolean(nameError)}
              data-cy={isEditMode ? 'editTaskName' : 'createTaskName'}
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
          </div>

          <div className="mb-3">
            <Label for="task-description">
              <Translate contentKey="processComposerApp.task.description">Description</Translate>
            </Label>
            <Input
              id="task-description"
              type="textarea"
              rows={3}
              value={description}
              data-cy={isEditMode ? 'editTaskDescription' : 'createTaskDescription'}
              onChange={event => setDescription(event.target.value)}
            />
          </div>

          <div className="mb-0">
            <Label for="task-activities">
              <Translate contentKey="processComposerApp.execution.tasks.createModal.activitiesLabel">Linked activities</Translate>
            </Label>
            <p className="text-muted small mb-2">
              <Translate contentKey="processComposerApp.execution.tasks.createModal.activitiesHint">
                Optional. Select zero or more activities from the source process.
              </Translate>
            </p>
            <EntityComboboxCreatable
              id="task-activities"
              options={activityOptions}
              value={selectedActivities}
              onChange={setSelectedActivities}
              placeholder={translate(
                'processComposerApp.execution.tasks.createModal.activitiesPlaceholder',
                'Search activities from the process...'
              )}
              data-cy={isEditMode ? 'editTaskActivities' : 'createTaskActivities'}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" outline onClick={onClose} disabled={taskUpdating}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button type="submit" color="primary" disabled={taskUpdating} data-cy={isEditMode ? 'editTaskSubmit' : 'createTaskSubmit'}>
            {taskUpdating ? (
              <>
                <Spinner size="sm" className="me-2" />
                {isEditMode ? (
                  <Translate contentKey="processComposerApp.execution.tasks.editModal.saving">Saving...</Translate>
                ) : (
                  <Translate contentKey="processComposerApp.execution.tasks.createModal.creating">Creating...</Translate>
                )}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="save" className="me-1" />
                {isEditMode ? (
                  <Translate contentKey="processComposerApp.execution.tasks.editModal.confirm">Save changes</Translate>
                ) : (
                  <Translate contentKey="processComposerApp.execution.tasks.createModal.confirm">Create task</Translate>
                )}
              </>
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
