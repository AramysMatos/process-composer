import React from 'react';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { ProcessDeleteTarget } from 'app/modules/process-design/hooks/use-process-entity-delete';

export interface ConfirmDeleteModalProps {
  target: ProcessDeleteTarget | null;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal = ({ target, deleting = false, onCancel, onConfirm }: ConfirmDeleteModalProps) => {
  const isOpen = target !== null;
  const activityCount = target?.type === 'phase' ? target.activityCount ?? 0 : 0;

  return (
    <Modal isOpen={isOpen} toggle={onCancel}>
      <ModalHeader toggle={onCancel} data-cy="process-entity-delete-dialog-heading">
        <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
      </ModalHeader>
      <ModalBody>
        {target?.type === 'phase' && activityCount > 0 && (
          <Alert color="warning" className="mb-3" data-cy="process-phase-delete-warning">
            <Translate
              contentKey="processComposerApp.processDesign.delete.phaseWithActivitiesWarning"
              interpolate={{ count: activityCount }}
            >
              {`This phase has ${activityCount} activities that will also be removed.`}
            </Translate>
          </Alert>
        )}

        {target?.type === 'phase' && (
          <Translate contentKey="processComposerApp.processDesign.delete.confirmPhase" interpolate={{ name: target.name }}>
            {`Are you sure you want to delete the phase "${target.name}"?`}
          </Translate>
        )}

        {target?.type === 'activity' && (
          <Translate contentKey="processComposerApp.processDesign.delete.confirmActivity" interpolate={{ name: target.name }}>
            {`Are you sure you want to delete the activity "${target.name}"?`}
          </Translate>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onCancel} disabled={deleting}>
          <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
        </Button>
        <Button color="danger" onClick={onConfirm} disabled={deleting} data-cy="process-entity-confirm-delete-button">
          <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDeleteModal;
