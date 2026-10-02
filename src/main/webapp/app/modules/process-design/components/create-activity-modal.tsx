import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntitySilent as createActivityEntity } from 'app/entities/activity/activity.reducer';
import { cloneActivity } from 'app/modules/process-design/clone-activity';
import { SearchableSourceListPicker } from 'app/modules/process-design/components/searchable-source-list-picker';
import { IActivity } from 'app/shared/model/activity.model';

type CreateMode = 'blank' | 'cloneLibrary' | 'cloneProcess';

export interface CreateActivityModalProps {
  isOpen: boolean;
  phaseId: number | null;
  processId?: number;
  phaseName?: string;
  onClose: () => void;
  onCreated?: (activityId: number) => void;
}

export const CreateActivityModal = ({ isOpen, phaseId, processId, phaseName, onClose, onCreated }: CreateActivityModalProps) => {
  const dispatch = useAppDispatch();
  const activityUpdating = useAppSelector(state => state.activity.updating);
  const phaseEntities = useAppSelector(state => state.phase.entities);

  const [mode, setMode] = useState<CreateMode>('blank');
  const [name, setName] = useState('');
  const [sourceActivityId, setSourceActivityId] = useState<string>('');
  const [libraryActivities, setLibraryActivities] = useState<IActivity[]>([]);
  const [processActivities, setProcessActivities] = useState<IActivity[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phase =
    phaseId !== null
      ? phaseEntities.find(item => item.id === phaseId) ?? (phaseName ? { id: phaseId, name: phaseName } : undefined)
      : undefined;

  const isCloneMode = mode === 'cloneLibrary' || mode === 'cloneProcess';

  useEffect(() => {
    if (!isOpen) {
      setMode('blank');
      setName('');
      setSourceActivityId('');
      setLibraryActivities([]);
      setProcessActivities([]);
      setSubmitError(null);
      return;
    }

    const loadSources = async () => {
      setLoadingSources(true);
      try {
        const cacheBuster = new Date().getTime();
        const libraryResponse = await axios.get<IActivity[]>(`api/activities?library=true&cacheBuster=${cacheBuster}`);
        setLibraryActivities(libraryResponse.data);

        if (processId) {
          const processResponse = await axios.get<IActivity[]>(`api/activities?processId=${processId}&cacheBuster=${cacheBuster}`);
          setProcessActivities(processResponse.data);
        } else {
          setProcessActivities([]);
        }
      } catch {
        setSubmitError(translate('processComposerApp.processDesign.canvas.cloneLoadError', 'Could not load activity sources.'));
      } finally {
        setLoadingSources(false);
      }
    };

    void loadSources();
  }, [isOpen, processId]);

  const cloneSourceItems = useMemo(() => {
    if (mode === 'cloneLibrary') {
      return libraryActivities;
    }
    if (mode === 'cloneProcess') {
      return processActivities;
    }
    return [];
  }, [libraryActivities, mode, processActivities]);

  const handleModeChange = (nextMode: CreateMode) => {
    setMode(nextMode);
    setSourceActivityId('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!phase?.id) {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createValidation', 'Name and phase are required.'));
      return;
    }

    try {
      if (mode === 'blank') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setSubmitError(translate('processComposerApp.processDesign.canvas.createValidation', 'Name and phase are required.'));
          return;
        }

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
        return;
      }

      const parsedSourceId = Number(sourceActivityId);
      if (!parsedSourceId || Number.isNaN(parsedSourceId)) {
        setSubmitError(translate('processComposerApp.processDesign.canvas.cloneSourceRequired', 'Select a source activity.'));
        return;
      }

      const createdId = await cloneActivity(dispatch, {
        sourceActivityId: parsedSourceId,
        targetPhaseId: phase.id,
        name: name.trim() || undefined,
        copyDependencies: false,
      });

      onCreated?.(createdId);
      onClose();
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createError', 'Could not create the activity.'));
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <Form
        onSubmit={event => {
          void handleSubmit(event);
        }}
      >
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

          <FormGroup tag="fieldset" className="mb-3">
            <legend className="col-form-label pt-0">
              <Translate contentKey="processComposerApp.processDesign.canvas.createModeLabel">Creation mode</Translate>
            </legend>
            <FormGroup check>
              <Input
                id="create-activity-mode-blank"
                name="createMode"
                type="radio"
                checked={mode === 'blank'}
                onChange={() => handleModeChange('blank')}
                data-cy="create-activity-mode-blank"
              />
              <Label check for="create-activity-mode-blank">
                <Translate contentKey="processComposerApp.processDesign.canvas.createModeBlank">Blank activity</Translate>
              </Label>
            </FormGroup>
            <FormGroup check>
              <Input
                id="create-activity-mode-clone-library"
                name="createMode"
                type="radio"
                checked={mode === 'cloneLibrary'}
                onChange={() => handleModeChange('cloneLibrary')}
                data-cy="create-activity-mode-clone-library"
              />
              <Label check for="create-activity-mode-clone-library">
                <Translate contentKey="processComposerApp.processDesign.canvas.createModeCloneLibrary">
                  Clone from library activity
                </Translate>
              </Label>
            </FormGroup>
            <FormGroup check>
              <Input
                id="create-activity-mode-clone-process"
                name="createMode"
                type="radio"
                checked={mode === 'cloneProcess'}
                onChange={() => handleModeChange('cloneProcess')}
                disabled={!processId}
                data-cy="create-activity-mode-clone-process"
              />
              <Label check for="create-activity-mode-clone-process">
                <Translate contentKey="processComposerApp.processDesign.canvas.createModeCloneProcess">
                  Clone from activity in this process
                </Translate>
              </Label>
            </FormGroup>
          </FormGroup>

          <FormGroup>
            <Label for={isCloneMode ? 'sidebar-clone-activity-name' : 'sidebar-new-activity-name'}>
              {isCloneMode ? (
                <Translate contentKey="processComposerApp.processDesign.canvas.cloneNameLabel">Name (optional)</Translate>
              ) : (
                <Translate contentKey="processComposerApp.processDesign.canvas.activityName">Activity name</Translate>
              )}
            </Label>
            <Input
              id={isCloneMode ? 'sidebar-clone-activity-name' : 'sidebar-new-activity-name'}
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder={
                isCloneMode
                  ? translate(
                      'processComposerApp.processDesign.canvas.cloneNamePlaceholder',
                      'Leave empty to use source name with copy suffix'
                    )
                  : undefined
              }
              data-cy={isCloneMode ? 'sidebar-clone-activity-name' : 'sidebar-new-activity-name'}
              autoFocus
              required={mode === 'blank'}
            />
          </FormGroup>

          {isCloneMode && (
            <FormGroup className="mb-0">
              <SearchableSourceListPicker
                key={mode}
                items={cloneSourceItems}
                selectedId={sourceActivityId}
                onSelect={setSourceActivityId}
                loading={loadingSources}
                dataCyPrefix="sidebar-clone-source-activity"
              />
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={onClose}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="primary" type="submit" disabled={activityUpdating || loadingSources} data-cy="confirm-sidebar-create-activity">
            <Translate contentKey="entity.action.save">Save</Translate>
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreateActivityModal;
