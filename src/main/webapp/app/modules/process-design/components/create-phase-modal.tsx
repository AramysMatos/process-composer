import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntitySilent as createPhaseEntity } from 'app/entities/phase/phase.reducer';
import { clonePhase } from 'app/modules/process-design/clone-phase';
import { IPhase } from 'app/shared/model/phase.model';

type CreateMode = 'blank' | 'clone';

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

  const [mode, setMode] = useState<CreateMode>('blank');
  const [name, setName] = useState('');
  const [sourcePhaseId, setSourcePhaseId] = useState<string>('');
  const [libraryPhases, setLibraryPhases] = useState<IPhase[]>([]);
  const [processPhases, setProcessPhases] = useState<IPhase[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const processMatches = processId !== null && process.id === processId;
  const processName = processMatches
    ? process.processName ?? translate('processComposerApp.processDesign.tree.untitledProcess', 'Untitled process')
    : undefined;

  useEffect(() => {
    if (!isOpen) {
      setMode('blank');
      setName('');
      setSourcePhaseId('');
      setLibraryPhases([]);
      setProcessPhases([]);
      setSubmitError(null);
      return;
    }

    if (processId === null) {
      return;
    }

    const loadSources = async () => {
      setLoadingSources(true);
      try {
        const cacheBuster = new Date().getTime();
        const [libraryResponse, processResponse] = await Promise.all([
          axios.get<IPhase[]>(`api/phases?library=true&cacheBuster=${cacheBuster}`),
          axios.get<IPhase[]>(`api/phases?processId=${processId}&cacheBuster=${cacheBuster}`),
        ]);
        setLibraryPhases(libraryResponse.data);
        setProcessPhases(processResponse.data);
      } catch {
        setSubmitError(translate('processComposerApp.processDesign.canvas.clonePhaseLoadError', 'Could not load phase sources.'));
      } finally {
        setLoadingSources(false);
      }
    };

    void loadSources();
  }, [isOpen, processId]);

  const sortedLibraryPhases = useMemo(
    () => [...libraryPhases].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' })),
    [libraryPhases]
  );

  const sortedProcessPhases = useMemo(
    () => [...processPhases].sort((left, right) => (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' })),
    [processPhases]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (processId === null) {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createPhaseValidation', 'Name and process are required.'));
      return;
    }

    try {
      if (mode === 'blank') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setSubmitError(translate('processComposerApp.processDesign.canvas.createPhaseValidation', 'Name and process are required.'));
          return;
        }

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
        return;
      }

      const parsedSourceId = Number(sourcePhaseId);
      if (!parsedSourceId || Number.isNaN(parsedSourceId)) {
        setSubmitError(translate('processComposerApp.processDesign.canvas.clonePhaseSourceRequired', 'Select a source phase.'));
        return;
      }

      const createdId = await clonePhase(dispatch, {
        sourcePhaseId: parsedSourceId,
        targetProcessId: processId,
        name: name.trim() || undefined,
        copyActivities: true,
      });

      onCreated?.(createdId);
      onClose();
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.canvas.createPhaseError', 'Could not create the phase.'));
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

          <FormGroup tag="fieldset" className="mb-3">
            <legend className="col-form-label pt-0">
              <Translate contentKey="processComposerApp.processDesign.canvas.createPhaseModeLabel">Creation mode</Translate>
            </legend>
            <FormGroup check>
              <Input
                id="create-phase-mode-blank"
                name="createPhaseMode"
                type="radio"
                checked={mode === 'blank'}
                onChange={() => setMode('blank')}
                data-cy="create-phase-mode-blank"
              />
              <Label check for="create-phase-mode-blank">
                <Translate contentKey="processComposerApp.processDesign.canvas.createPhaseModeBlank">Blank phase</Translate>
              </Label>
            </FormGroup>
            <FormGroup check>
              <Input
                id="create-phase-mode-clone"
                name="createPhaseMode"
                type="radio"
                checked={mode === 'clone'}
                onChange={() => setMode('clone')}
                data-cy="create-phase-mode-clone"
              />
              <Label check for="create-phase-mode-clone">
                <Translate contentKey="processComposerApp.processDesign.canvas.createPhaseModeClone">Clone from existing phase</Translate>
              </Label>
            </FormGroup>
          </FormGroup>

          {mode === 'blank' && (
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
          )}

          {mode === 'clone' && (
            <>
              <FormGroup>
                <Label for="sidebar-clone-source-phase">
                  <Translate contentKey="processComposerApp.processDesign.canvas.clonePhaseSourceLabel">Source phase</Translate>
                </Label>
                <Input
                  id="sidebar-clone-source-phase"
                  type="select"
                  value={sourcePhaseId}
                  onChange={event => setSourcePhaseId(event.target.value)}
                  disabled={loadingSources}
                  data-cy="sidebar-clone-source-phase"
                  required
                >
                  <option value="">
                    {loadingSources
                      ? translate('processComposerApp.processDesign.canvas.clonePhaseLoading', 'Loading phases...')
                      : translate('processComposerApp.processDesign.canvas.clonePhaseSourcePlaceholder', 'Select a phase')}
                  </option>
                  {sortedLibraryPhases.length > 0 && (
                    <optgroup label={translate('processComposerApp.processDesign.canvas.clonePhaseSourceLibrary', 'Library')}>
                      {sortedLibraryPhases.map(phase => (
                        <option key={`library-${phase.id}`} value={phase.id}>
                          {phase.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {sortedProcessPhases.length > 0 && (
                    <optgroup label={translate('processComposerApp.processDesign.canvas.clonePhaseSourceProcess', 'In this process')}>
                      {sortedProcessPhases.map(phase => (
                        <option key={`process-${phase.id}`} value={phase.id}>
                          {phase.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label for="sidebar-clone-phase-name">
                  <Translate contentKey="processComposerApp.processDesign.canvas.clonePhaseNameLabel">Name (optional)</Translate>
                </Label>
                <Input
                  id="sidebar-clone-phase-name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={translate(
                    'processComposerApp.processDesign.canvas.clonePhaseNamePlaceholder',
                    'Leave empty to use source name with copy suffix'
                  )}
                  data-cy="sidebar-clone-phase-name"
                />
              </FormGroup>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={onClose}>
            <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="primary" type="submit" disabled={phaseUpdating || loadingSources} data-cy="confirm-sidebar-create-phase">
            <Translate contentKey="entity.action.save">Save</Translate>
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CreatePhaseModal;
