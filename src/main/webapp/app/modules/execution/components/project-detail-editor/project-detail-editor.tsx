import './project-detail-editor.scss';

import React, { useEffect, useState } from 'react';
import { Alert, Button, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity, updateEntity } from 'app/entities/project/project.reducer';
import { IProject } from 'app/shared/model/project.model';

export interface ProjectDetailEditorProps {
  projectId: number | null;
  onSaved?: () => void;
}

export const ProjectDetailEditor = ({ projectId, onSaved }: ProjectDetailEditorProps) => {
  const dispatch = useAppDispatch();

  const projectEntity = useAppSelector(state => state.project.entity);
  const loading = useAppSelector(state => state.project.loading);
  const updating = useAppSelector(state => state.project.updating);

  const [draft, setDraft] = useState<IProject | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setDraft(null);
      setSaveError(null);
      return;
    }

    dispatch(getEntity(projectId));
  }, [projectId, dispatch]);

  useEffect(() => {
    if (!projectId || projectEntity.id !== projectId) {
      return;
    }
    setDraft({ ...projectEntity });
  }, [projectEntity, projectId]);

  const handleSave = async () => {
    if (!draft?.id) {
      return;
    }

    setSaveError(null);

    try {
      await dispatch(updateEntity(draft)).unwrap();
      await dispatch(getEntity(draft.id));
      toast.success(translate('processComposerApp.execution.projectDrawer.saveSuccess', 'Project saved successfully.'));
      onSaved?.();
    } catch {
      setSaveError(translate('processComposerApp.execution.projectDrawer.saveError', 'Could not save the project.'));
    }
  };

  if (!projectId) {
    return null;
  }

  const isLoading = loading || (!draft && projectId !== null);
  const isBusy = updating;

  return (
    <div className="project-detail-editor" data-cy="project-detail-editor">
      {saveError && (
        <Alert color="danger" toggle={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {isLoading && (
        <div className="project-detail-editor__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!isLoading && draft && (
        <>
          <div className="project-detail-editor__sections">
            <section className="project-detail-editor__section" data-cy="project-section-general">
              <FormGroup>
                <Label for="project-editor-name">
                  <Translate contentKey="processComposerApp.project.name">Name</Translate>
                </Label>
                <Input
                  id="project-editor-name"
                  value={draft.name ?? ''}
                  disabled={updating}
                  onChange={event => setDraft({ ...draft, name: event.target.value })}
                  data-cy="project-editor-name"
                />
              </FormGroup>
              <FormGroup>
                <Label for="project-editor-description">
                  <Translate contentKey="processComposerApp.project.description">Description</Translate>
                </Label>
                <Input
                  id="project-editor-description"
                  type="textarea"
                  rows={4}
                  value={draft.description ?? ''}
                  disabled={updating}
                  onChange={event => setDraft({ ...draft, description: event.target.value })}
                  data-cy="project-editor-description"
                />
              </FormGroup>
            </section>
          </div>

          <div className="project-detail-editor__footer">
            <Button color="primary" onClick={() => void handleSave()} disabled={isBusy} data-cy="project-editor-save">
              {updating ? (
                <Translate contentKey="processComposerApp.execution.projectDrawer.saving">Saving...</Translate>
              ) : (
                <Translate contentKey="entity.action.save">Save</Translate>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDetailEditor;
