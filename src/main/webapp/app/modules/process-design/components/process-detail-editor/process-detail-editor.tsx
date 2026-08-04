import './process-detail-editor.scss';

import React, { useEffect, useState } from 'react';
import { Alert, Button, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity, updateEntity } from 'app/entities/process/process.reducer';
import { IProcess } from 'app/shared/model/process.model';

export interface ProcessDetailEditorProps {
  processId: number | null;
  onSaved?: () => void;
}

export const ProcessDetailEditor = ({ processId, onSaved }: ProcessDetailEditorProps) => {
  const dispatch = useAppDispatch();

  const processEntity = useAppSelector(state => state.process.entity);
  const loading = useAppSelector(state => state.process.loading);
  const updating = useAppSelector(state => state.process.updating);

  const [draft, setDraft] = useState<IProcess | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!processId) {
      setDraft(null);
      setSaveError(null);
      return;
    }

    dispatch(getEntity(processId));
  }, [processId, dispatch]);

  useEffect(() => {
    if (!processId || processEntity.id !== processId) {
      return;
    }
    setDraft({ ...processEntity });
  }, [processEntity, processId]);

  const handleSave = async () => {
    if (!draft?.id) {
      return;
    }

    setSaveError(null);

    try {
      await dispatch(updateEntity(draft)).unwrap();
      await dispatch(getEntity(draft.id));
      toast.success(translate('processComposerApp.processDesign.processDrawer.saveSuccess', 'Process saved successfully.'));
      onSaved?.();
    } catch {
      setSaveError(translate('processComposerApp.processDesign.processDrawer.saveError', 'Could not save the process.'));
    }
  };

  if (!processId) {
    return null;
  }

  const isLoading = loading || (!draft && processId !== null);
  const isBusy = updating;

  return (
    <div className="process-detail-editor" data-cy="process-detail-editor">
      {saveError && (
        <Alert color="danger" toggle={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {isLoading && (
        <div className="process-detail-editor__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!isLoading && draft && (
        <>
          <div className="process-detail-editor__sections">
            <section className="process-detail-editor__section" data-cy="process-section-general">
              <FormGroup>
                <Label for="process-editor-name">
                  <Translate contentKey="processComposerApp.process.processName">Process Name</Translate>
                </Label>
                <Input
                  id="process-editor-name"
                  value={draft.processName ?? ''}
                  disabled={updating}
                  onChange={event => setDraft({ ...draft, processName: event.target.value })}
                  data-cy="process-editor-name"
                />
              </FormGroup>
              <FormGroup>
                <Label for="process-editor-description">
                  <Translate contentKey="processComposerApp.process.processDescription">Process Description</Translate>
                </Label>
                <Input
                  id="process-editor-description"
                  type="textarea"
                  rows={4}
                  value={draft.processDescription ?? ''}
                  disabled={updating}
                  onChange={event => setDraft({ ...draft, processDescription: event.target.value })}
                  data-cy="process-editor-description"
                />
              </FormGroup>
            </section>
          </div>

          <div className="process-detail-editor__footer">
            <Button color="primary" onClick={() => void handleSave()} disabled={isBusy} data-cy="process-editor-save">
              {updating ? (
                <Translate contentKey="processComposerApp.processDesign.drawer.saving">Saving...</Translate>
              ) : (
                <Translate contentKey="processComposerApp.processDesign.drawer.save">Save</Translate>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProcessDetailEditor;
