import './phase-detail-editor.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, updateEntity, updateEntitySilent } from 'app/entities/phase/phase.reducer';
import { clonePhase } from 'app/modules/process-design/clone-phase';
import { IPhase } from 'app/shared/model/phase.model';
import { CardActionsMenu, CardActionItem } from 'app/shared-ui/card-actions-menu';
import { PhaseActivitiesSection } from './phase-activities-section';

export interface PhaseDetailEditorProps {
  phaseId: number | null;
  processId?: number;
  variant?: 'panel' | 'drawer';
  showHeaderActions?: boolean;
  onSaved?: () => void;
  onDelete?: (phase: { id: number; name: string }) => void;
  onDeleted?: () => void;
  onDuplicated?: (phaseId: number) => void;
  deleting?: boolean;
}

export const PhaseDetailEditor = ({
  phaseId,
  processId,
  variant = 'panel',
  showHeaderActions = true,
  onSaved,
  onDelete,
  onDeleted,
  onDuplicated,
  deleting = false,
}: PhaseDetailEditorProps) => {
  const dispatch = useAppDispatch();
  const isLibraryContext = processId === undefined;

  const phaseEntity = useAppSelector(state => state.phase.entity);
  const loading = useAppSelector(state => state.phase.loading);
  const updating = useAppSelector(state => state.phase.updating);

  const [draft, setDraft] = useState<IPhase | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [activityEditing, setActivityEditing] = useState(false);

  useEffect(() => {
    if (!phaseId) {
      setDraft(null);
      setSaveError(null);
      setDuplicating(false);
      setActivityEditing(false);
      return;
    }

    dispatch(getEntity(phaseId));
  }, [phaseId, dispatch]);

  useEffect(() => {
    if (!phaseId || phaseEntity.id !== phaseId) {
      return;
    }
    setDraft({ ...phaseEntity });
  }, [phaseEntity, phaseId]);

  const handleSave = async () => {
    if (!draft?.id) {
      return;
    }

    setSaveError(null);

    try {
      const saveThunk = isLibraryContext ? updateEntitySilent : updateEntity;
      await dispatch(saveThunk(draft)).unwrap();
      await dispatch(getEntity(draft.id));
      toast.success(translate('processComposerApp.processDesign.drawer.saveSuccess', 'Saved successfully.'));
      onSaved?.();
    } catch {
      setSaveError(translate('processComposerApp.processDesign.drawer.saveError', 'Could not save the phase.'));
    }
  };

  const handleDelete = useCallback(async () => {
    if (!draft?.id) {
      return;
    }

    if (onDelete) {
      onDelete({
        id: draft.id,
        name: draft.name ?? '',
      });
      return;
    }

    try {
      await dispatch(deleteEntity(draft.id)).unwrap();
      toast.success(translate('entity.delete.success', 'Deleted successfully.'));
      onDeleted?.();
    } catch {
      toast.error(translate('entity.delete.fail', 'Delete failed.'));
    }
  }, [dispatch, draft, onDelete, onDeleted]);

  const handleDuplicate = async () => {
    if (!draft?.id || duplicating) {
      return;
    }

    setDuplicating(true);
    try {
      const newPhaseId = await clonePhase(dispatch, {
        sourcePhaseId: draft.id,
        targetProcessId: null,
        copyActivities: true,
      });
      toast.success(translate('processComposerApp.library.phases.duplicateSuccess', 'Phase duplicated successfully.'));
      onDuplicated?.(newPhaseId);
    } catch {
      toast.error(translate('processComposerApp.library.phases.duplicateError', 'Could not duplicate the phase.'));
    } finally {
      setDuplicating(false);
    }
  };

  const isLoading = loading || (!draft && phaseId !== null);
  const isBusy = updating || deleting || duplicating;

  const menuItems: CardActionItem[] = [];
  if (draft?.id && showHeaderActions) {
    if (isLibraryContext) {
      menuItems.push({
        key: 'duplicate',
        label: (
          <>
            <FontAwesomeIcon icon="copy" className="me-2" />
            <Translate contentKey="processComposerApp.library.phases.duplicate">Duplicate phase</Translate>
          </>
        ),
        onClick() {
          void handleDuplicate();
        },
        disabled: isBusy,
        'data-cy': `phaseDuplicate-${draft.id}`,
      });
    }
    menuItems.push({
      key: 'delete',
      label: (
        <>
          <FontAwesomeIcon icon="trash" className="me-2" />
          <Translate contentKey="entity.action.delete">Delete</Translate>
        </>
      ),
      onClick() {
        void handleDelete();
      },
      danger: true,
      disabled: isBusy,
      'data-cy': `phaseDelete-${draft.id}`,
    });
  }

  if (!phaseId) {
    return null;
  }

  const saveButton = (
    <Button color="primary" onClick={() => void handleSave()} disabled={isBusy} data-cy="phase-editor-save">
      {updating ? (
        <Translate contentKey="processComposerApp.processDesign.drawer.saving">Saving...</Translate>
      ) : (
        <Translate contentKey="processComposerApp.processDesign.drawer.save">Save</Translate>
      )}
    </Button>
  );

  return (
    <div className={`phase-detail-editor phase-detail-editor--${variant}`} data-cy="phase-detail-editor">
      {variant === 'panel' && draft && (
        <div className="phase-detail-editor__panel-header">
          <div className="phase-detail-editor__title-block">
            <h2 className="h5 mb-0">{draft.name}</h2>
          </div>
          {menuItems.length > 0 && <CardActionsMenu data-cy={`phaseEditorMenu-${draft.id}`} items={menuItems} />}
        </div>
      )}

      {variant === 'drawer' && menuItems.length > 0 && (
        <div className="phase-detail-editor__drawer-actions mb-3 d-flex justify-content-end">
          <CardActionsMenu data-cy={`phaseEditorMenu-${draft?.id}`} items={menuItems} />
        </div>
      )}

      {saveError && (
        <Alert color="danger" toggle={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {isLoading && (
        <div className="phase-detail-editor__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!isLoading && draft && (
        <>
          <div className="phase-detail-editor__sections">
            {!activityEditing && (
              <section className="phase-detail-editor__section" data-cy="phase-section-general">
                <h3 className="phase-detail-editor__section-title">
                  <Translate contentKey="processComposerApp.processDesign.drawer.tabs.general">General</Translate>
                </h3>
                <FormGroup>
                  <Label for="phase-editor-name">
                    <Translate contentKey="processComposerApp.phase.name">Name</Translate>
                  </Label>
                  <Input
                    id="phase-editor-name"
                    value={draft.name ?? ''}
                    disabled={updating}
                    onChange={event => setDraft({ ...draft, name: event.target.value })}
                    data-cy="phase-editor-name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="phase-editor-description">
                    <Translate contentKey="processComposerApp.phase.description">Description</Translate>
                  </Label>
                  <Input
                    id="phase-editor-description"
                    type="textarea"
                    rows={4}
                    value={draft.description ?? ''}
                    disabled={updating}
                    onChange={event => setDraft({ ...draft, description: event.target.value })}
                    data-cy="phase-editor-description"
                  />
                </FormGroup>
              </section>
            )}

            <section className="phase-detail-editor__section" data-cy="phase-section-activities">
              <h3 className="phase-detail-editor__section-title">
                <Translate contentKey="processComposerApp.library.tabs.activities">Activities</Translate>
              </h3>
              <PhaseActivitiesSection
                phaseId={draft.id!}
                phaseName={draft.name}
                processId={processId}
                disabled={updating}
                onActivityEditingChange={setActivityEditing}
              />
            </section>
          </div>

          {!activityEditing && <div className="phase-detail-editor__footer">{saveButton}</div>}
        </>
      )}
    </div>
  );
};

export default PhaseDetailEditor;
