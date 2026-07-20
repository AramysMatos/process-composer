import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch } from 'app/config/store';
import { deleteEntity as deleteActivity, getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { ActivityDetailEditor } from 'app/modules/process-design/components/activity-detail-drawer/activity-detail-editor';
import { CreateActivityModal } from 'app/modules/process-design/components/create-activity-modal';
import { EntityDeleteButton } from 'app/modules/process-design/components/entity-delete-button';
import { IActivity } from 'app/shared/model/activity.model';

export interface PhaseActivitiesSectionProps {
  phaseId: number;
  phaseName?: string;
  processId?: number;
  disabled?: boolean;
  onActivityEditingChange?: (editing: boolean) => void;
}

export const PhaseActivitiesSection = ({
  phaseId,
  phaseName,
  processId,
  disabled = false,
  onActivityEditingChange,
}: PhaseActivitiesSectionProps) => {
  const dispatch = useAppDispatch();

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshActivities = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dispatch(getActivities({ phaseId, eagerload: true })).unwrap();
      setActivities(result.data);
    } finally {
      setLoading(false);
    }
  }, [dispatch, phaseId]);

  useEffect(() => {
    void refreshActivities();
    setSelectedActivityId(null);
    setCreateModalOpen(false);
  }, [phaseId, refreshActivities]);

  useEffect(() => {
    onActivityEditingChange?.(selectedActivityId !== null);
  }, [selectedActivityId, onActivityEditingChange]);

  const handleDeleteRequest = (activity: { id: number; name: string }) => {
    setActivityToDelete(activity);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteActivity(activityToDelete.id)).unwrap();
      if (selectedActivityId === activityToDelete.id) {
        setSelectedActivityId(null);
      }
      setDeleteModalOpen(false);
      setActivityToDelete(null);
      await refreshActivities();
    } finally {
      setDeleting(false);
    }
  };

  const handleActivityCreated = async (activityId: number) => {
    setCreateModalOpen(false);
    await refreshActivities();
    setSelectedActivityId(activityId);
  };

  return (
    <>
      <div className="phase-activities-section" data-cy="phase-activities-section">
        {selectedActivityId !== null ? (
          <div className="phase-activities-section__editor">
            <Button color="link" className="px-0 mb-2" onClick={() => setSelectedActivityId(null)} data-cy="phase-activity-back">
              <FontAwesomeIcon icon="arrow-left" className="me-2" />
              <Translate contentKey="processComposerApp.library.phases.backToPhase">Back to phase</Translate>
            </Button>
            <ActivityDetailEditor
              activityId={selectedActivityId}
              phaseId={phaseId}
              variant="panel"
              embeddedInPhase
              showHeaderActions
              onSaved={refreshActivities}
              onDelete={handleDeleteRequest}
            />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <span className="text-muted small">
                <Translate contentKey="processComposerApp.library.phases.activitiesCount" interpolate={{ count: activities.length }}>
                  {`${activities.length} activities`}
                </Translate>
              </span>
              <Button
                color="primary"
                size="sm"
                outline
                onClick={() => setCreateModalOpen(true)}
                disabled={disabled}
                data-cy="phase-new-activity"
              >
                <FontAwesomeIcon icon="plus" />{' '}
                <Translate contentKey="processComposerApp.library.phases.newActivity">New activity</Translate>
              </Button>
            </div>

            {loading && (
              <div className="text-center py-3">
                <Spinner color="primary" size="sm" />
              </div>
            )}

            {!loading && activities.length === 0 && (
              <div className="alert alert-light mb-0" data-cy="phase-activities-empty">
                <Translate contentKey="processComposerApp.library.phases.noActivities">No activities in this phase yet.</Translate>
              </div>
            )}

            {!loading && activities.length > 0 && (
              <div className="phase-activities-section__list">
                {activities.map(activity => (
                  <div key={activity.id} className="phase-activities-section__list-row">
                    <button
                      type="button"
                      className="phase-activities-section__list-item"
                      onClick={() => activity.id && setSelectedActivityId(activity.id)}
                      data-cy={`phase-activity-item-${activity.id}`}
                    >
                      <span className="phase-activities-section__list-item-name">{activity.name}</span>
                      {activity.description && (
                        <span className="phase-activities-section__list-item-description">{activity.description}</span>
                      )}
                    </button>
                    {activity.id && (
                      <EntityDeleteButton
                        label={translate('processComposerApp.processDesign.delete.deleteActivity', 'Delete activity')}
                        onClick={() => handleDeleteRequest({ id: activity.id as number, name: activity.name ?? '' })}
                        disabled={disabled || deleting}
                        data-cy={`phase-activity-delete-${activity.id}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateActivityModal
        isOpen={createModalOpen}
        phaseId={phaseId}
        phaseName={phaseName}
        processId={processId}
        onClose={() => setCreateModalOpen(false)}
        onCreated={activityId => void handleActivityCreated(activityId)}
      />

      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.library.delete.confirm" interpolate={{ name: activityToDelete?.name ?? '' }}>
            Are you sure you want to delete this item?
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="danger" onClick={() => void handleConfirmDelete()} disabled={deleting} data-cy="phase-activity-confirm-delete">
            <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PhaseActivitiesSection;
