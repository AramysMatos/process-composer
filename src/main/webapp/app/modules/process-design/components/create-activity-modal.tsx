import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntitySilent as createActivityEntity } from 'app/entities/activity/activity.reducer';

export interface CreateActivityModalProps {
  isOpen: boolean;
  phaseId: number | null;
  onClose: () => void;
  onCreated?: (activityId: number) => void;
}

export const CreateActivityModal = ({ isOpen, phaseId, onClose, onCreated }: CreateActivityModalProps) => {
  const dispatch = useAppDispatch();
  const activityUpdating = useAppSelector(state => state.activity.updating);
  const phaseEntities = useAppSelector(state => state.phase.entities);

  const [name, setName] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phase = phaseId !== null ? phaseEntities.find(item => item.id === phaseId) : undefined;

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedName = name.trim();
    if (!trimmedName || !phase?.id) {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createValidation', 'Name and phase are required.'));
      return;
    }

    try {
      const result = await dispatch(
        createActivityEntity({
          name: trimmedName,
          phase: { id: phase.id, name: phase.name },
          subActivities: [],
          predecessorActivities: [],
        })
      ).unwrap();

      const createdId = result.data.id;
      if (createdId) {
        onCreated?.(createdId);
      }
      onClose();
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createError', 'Could not create the activity.'));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={onClose}>
          <Translate contentKey="processComposerApp.processDesign.canvas.createTitle">New activity</Translate>
        </ModalHeader>
        <ModalBody>
          {submitError && (
            <Alert color="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          {phase?.name && (
            <p className="text-muted small mb-3">
              <Translate contentKey="processComposerApp.processDesign.canvas.targetPhase">Target phase</Translate>
              {': '}
              <strong>{phase.name}</strong>
            </p>
          )}

          <FormGroup>
            <Label for="sidebar-new-activity-name">
              <Translate contentKey="processComposerApp.processDesign.canvas.activityName">Activity name</Translate>
            </Label>
            <Input
              id="sidebar-new-activity-name"
              value={name}
              onChange={event => setName(event.target.value)}
              data-cy="sidebar-new-activity-name"
              autoFocus
              required
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={onClose}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="primary" type="submit" disabled={activityUpdating} data-cy="confirm-sidebar-create-activity">
            <Translate contentKey="entity.action.save">Save</Translate>
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreateActivityModal;
