import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntitySilent as createActivityEntity } from 'app/entities/activity/activity.reducer';
import { cloneActivity } from 'app/modules/process-design/clone-activity';
import { IActivity } from 'app/shared/model/activity.model';

type CreateMode = 'blank' | 'clone';

export interface CreateActivityModalProps {
  isOpen: boolean;
  phaseId: number | null;
  processId: number;
  onClose: () => void;
  onCreated?: (activityId: number) => void;
}

export const CreateActivityModal = ({ isOpen, phaseId, processId, onClose, onCreated }: CreateActivityModalProps) => {
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

  const phase = phaseId !== null ? phaseEntities.find(item => item.id === phaseId) : undefined;

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
        const [libraryResponse, processResponse] = await Promise.all([
          axios.get<IActivity[]>(`api/activities?library=true&cacheBuster=${cacheBuster}`),
          axios.get<IActivity[]>(`api/activities?processId=${processId}&cacheBuster=${cacheBuster}`),
        ]);
        setLibraryActivities(libraryResponse.data);
        setProcessActivities(processResponse.data);
      } catch {
        setSubmitError(translate('processComposerApp.processDesign.canvas.cloneLoadError', 'Could not load activity sources.'));
      } finally {
        setLoadingSources(false);
      }
    };

    void loadSources();
  }, [isOpen, processId]);

  const sortedLibraryActivities = useMemo(
    () =>
      [...libraryActivities].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' })),
    [libraryActivities]
  );

  const sortedProcessActivities = useMemo(
    () =>
      [...processActivities].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' })),
    [processActivities]
  );

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
                onChange={() => setMode('blank')}
                data-cy="create-activity-mode-blank"
              />
              <Label check for="create-activity-mode-blank">
                <Translate contentKey="processComposerApp.processDesign.canvas.createModeBlank">Blank activity</Translate>
              </Label>
            </FormGroup>
            <FormGroup check>
              <Input
                id="create-activity-mode-clone"
                name="createMode"
                type="radio"
                checked={mode === 'clone'}
                onChange={() => setMode('clone')}
                data-cy="create-activity-mode-clone"
              />
              <Label check for="create-activity-mode-clone">
                <Translate contentKey="processComposerApp.processDesign.canvas.createModeClone">Clone from existing activity</Translate>
              </Label>
            </FormGroup>
          </FormGroup>

          {mode === 'blank' && (
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
          )}

          {mode === 'clone' && (
            <>
              <FormGroup>
                <Label for="sidebar-clone-source-activity">
                  <Translate contentKey="processComposerApp.processDesign.canvas.cloneSourceLabel">Source activity</Translate>
                </Label>
                <Input
                  id="sidebar-clone-source-activity"
                  type="select"
                  value={sourceActivityId}
                  onChange={event => setSourceActivityId(event.target.value)}
                  disabled={loadingSources}
                  data-cy="sidebar-clone-source-activity"
                  required
                >
                  <option value="">
                    {loadingSources
                      ? translate('processComposerApp.processDesign.canvas.cloneLoading', 'Loading activities...')
                      : translate('processComposerApp.processDesign.canvas.cloneSourcePlaceholder', 'Select an activity')}
                  </option>
                  {sortedLibraryActivities.length > 0 && (
                    <optgroup label={translate('processComposerApp.processDesign.canvas.cloneSourceLibrary', 'Library')}>
                      {sortedLibraryActivities.map(activity => (
                        <option key={`library-${activity.id}`} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {sortedProcessActivities.length > 0 && (
                    <optgroup label={translate('processComposerApp.processDesign.canvas.cloneSourceProcess', 'In this process')}>
                      {sortedProcessActivities.map(activity => (
                        <option key={`process-${activity.id}`} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label for="sidebar-clone-activity-name">
                  <Translate contentKey="processComposerApp.processDesign.canvas.cloneNameLabel">Name (optional)</Translate>
                </Label>
                <Input
                  id="sidebar-clone-activity-name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={translate(
                    'processComposerApp.processDesign.canvas.cloneNamePlaceholder',
                    'Leave empty to use source name with copy suffix'
                  )}
                  data-cy="sidebar-clone-activity-name"
                />
              </FormGroup>
            </>
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
