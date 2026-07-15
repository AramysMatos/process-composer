import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntitySilent as createPhaseEntity } from 'app/entities/phase/phase.reducer';

export interface CreatePhaseModalProps {
  isOpen: boolean;
  processId: number | null;
  onClose: () => void;
  onCreated?: (phaseId: number) => void;
}

export const CreatePhaseModal = ({ isOpen, processId, onClose, onCreated }: CreatePhaseModalProps) => {
  const dispatch = useAppDispatch();
  const phaseUpdating = useAppSelector(state => state.phase.updating);
  const process = useAppSelector(state => state.process.entity);

  const [name, setName] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const processMatches = processId !== null && process.id === processId;
  const processName = processMatches
    ? process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process')
    : undefined;

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
    if (!trimmedName || processId === null) {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createPhaseValidation', 'Name and process are required.'));
      return;
    }

    try {
      const result = await dispatch(
        createPhaseEntity({
          name: trimmedName,
          process: { id: processId, processName: processName },
        })
      ).unwrap();

      const createdId = result.data.id;
      if (createdId) {
        onCreated?.(createdId);
      }
      onClose();
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createPhaseError', 'Could not create the phase.'));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={onClose}>
          <Translate contentKey="processComposerApp.processDesign.canvas.createPhaseTitle">New phase</Translate>
        </ModalHeader>
        <ModalBody>
          {submitError && (
            <Alert color="danger" className="mb-3">
              {submitError}
            </Alert>
          )}

          {processName && (
            <p className="text-muted small mb-3">
              <Translate contentKey="processComposerApp.processDesign.canvas.targetProcess">Target process</Translate>
              {': '}
              <strong>{processName}</strong>
            </p>
          )}

          <FormGroup>
            <Label for="sidebar-new-phase-name">
              <Translate contentKey="processComposerApp.processDesign.canvas.phaseName">Phase name</Translate>
            </Label>
            <Input
              id="sidebar-new-phase-name"
              value={name}
              onChange={event => setName(event.target.value)}
              data-cy="sidebar-new-phase-name"
              autoFocus
              required
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={onClose}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="primary" type="submit" disabled={phaseUpdating} data-cy="confirm-sidebar-create-phase">
            <Translate contentKey="entity.action.save">Save</Translate>
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreatePhaseModal;
