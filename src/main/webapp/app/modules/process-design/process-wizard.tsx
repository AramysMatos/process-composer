import './process-wizard.scss';
import { FieldError } from 'react-hook-form';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { Alert, Button, Card, CardBody, Form, FormFeedback, FormGroup, Input, Label, ListGroup, ListGroupItem, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { createEntity as createPhase } from 'app/entities/phase/phase.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { createEntity as createProcess, getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { ActivitySelectionTree } from 'app/modules/execution/components/activity-selection-tree';
import {
  buildActivitySelectionTree,
  getAllActivityIdsFromTree,
  getAllEmptyPhaseIdsFromTree,
} from 'app/modules/execution/components/activity-selection-tree.utils';
import { cloneSelectedFromProcess } from 'app/modules/process-design/clone-selected-from-process';
import { IPhase } from 'app/shared/model/phase.model';
import { IProcess } from 'app/shared/model/process.model';
import { ProcessWizardFormValues, processWizardSchema, processWizardStep1Schema, processWizardStep2Schema } from './dto';

const WIZARD_STEPS = [
  { key: 'process', labelKey: 'processComposerApp.processDesign.wizard.steps.process' },
  { key: 'phases', labelKey: 'processComposerApp.processDesign.wizard.steps.phases' },
  { key: 'confirm', labelKey: 'processComposerApp.processDesign.wizard.steps.confirm' },
] as const;

const applyZodErrors = (
  setError: ReturnType<typeof useForm<ProcessWizardFormValues>>['setError'],
  error: { issues: Array<{ path: (string | number)[]; message: string }> }
) => {
  error.issues.forEach(issue => {
    const fieldPath = issue.path.join('.');
    setError(fieldPath as keyof ProcessWizardFormValues & `phases.${number}.name` & `phases.${number}.description`, {
      type: 'manual',
      message: issue.message,
    });
  });
};

export const ProcessWizard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const processes = useAppSelector(state => state.process.entities);
  const processesLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const initializedCloneSelectionRef = useRef<number | undefined>();

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcessWizardFormValues>({
    mode: 'onTouched',
    defaultValues: {
      processName: '',
      processDescription: '',
      creationMode: 'blank',
      sourceProcessId: undefined,
      selectedActivityIds: [],
      selectedEmptyPhaseIds: [],
      phases: [{ name: '', description: '' }],
    },
  });

  const processNameField = register('processName');
  const processDescriptionField = register('processDescription');
  const sourceProcessIdField = register('sourceProcessId', { valueAsNumber: true });

  const creationMode = watch('creationMode');
  const sourceProcessId = watch('sourceProcessId');
  const selectedActivityIds = watch('selectedActivityIds');
  const selectedEmptyPhaseIds = watch('selectedEmptyPhaseIds');

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'phases',
  });

  const sourceProcess = useMemo(() => processes.find(process => process.id === sourceProcessId), [processes, sourceProcessId]);

  const activityTree = useMemo(
    () => buildActivitySelectionTree(sourceProcessId, phaseEntities, activityEntities),
    [activityEntities, phaseEntities, sourceProcessId]
  );

  const treeLoading = phaseLoading || activityLoading;
  const selectedCloneItemCount = selectedActivityIds.length + selectedEmptyPhaseIds.length;

  useEffect(() => {
    dispatch(getProcesses({}));
  }, [dispatch]);

  useEffect(() => {
    if (!Number.isFinite(sourceProcessId) || (sourceProcessId ?? 0) <= 0) {
      return;
    }

    dispatch(getPhases({}));
    dispatch(getActivities({ eagerload: true }));
  }, [dispatch, sourceProcessId]);

  useEffect(() => {
    if (creationMode !== 'fromProcess' || activeStep !== 1 || treeLoading || activityTree.length === 0) {
      return;
    }

    if (initializedCloneSelectionRef.current === sourceProcessId) {
      return;
    }

    setValue('selectedActivityIds', getAllActivityIdsFromTree(activityTree));
    setValue('selectedEmptyPhaseIds', getAllEmptyPhaseIdsFromTree(activityTree));
    initializedCloneSelectionRef.current = sourceProcessId;
  }, [activeStep, activityTree, creationMode, setValue, sourceProcessId, treeLoading]);

  useEffect(() => {
    initializedCloneSelectionRef.current = undefined;
    setValue('selectedActivityIds', []);
    setValue('selectedEmptyPhaseIds', []);
  }, [sourceProcessId, setValue]);

  const goToNextStep = () => {
    clearErrors();
    const values = getValues();

    if (activeStep === 0) {
      const result = processWizardStep1Schema.safeParse(values);
      if (!result.success) {
        applyZodErrors(setError, result.error);
        return;
      }
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      const result = processWizardStep2Schema.safeParse(values);
      if (!result.success) {
        applyZodErrors(setError, result.error);
        return;
      }
      setActiveStep(2);
    }
  };

  const goToPreviousStep = () => {
    clearErrors();
    setActiveStep(current => Math.max(0, current - 1));
  };

  const phasesError = errors.phases as unknown as FieldError | undefined;
  const sourceProcessIdError = errors.sourceProcessId as FieldError | undefined;
  const selectedActivityIdsError = errors.selectedActivityIds as unknown as FieldError | undefined;

  const onSubmit = async (data: ProcessWizardFormValues) => {
    const validation = processWizardSchema.safeParse(data);
    if (!validation.success) {
      applyZodErrors(setError, validation.error);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let createdProcessId: number;

      if (validation.data.creationMode === 'fromProcess') {
        createdProcessId = await cloneSelectedFromProcess(dispatch, {
          processName: validation.data.processName,
          processDescription: validation.data.processDescription,
          sourceProcessId: validation.data.sourceProcessId,
          selectedActivityIds: validation.data.selectedActivityIds,
          selectedEmptyPhaseIds: validation.data.selectedEmptyPhaseIds,
          activityTree,
        });
      } else {
        const processPayload: IProcess = {
          processName: validation.data.processName,
          processDescription: validation.data.processDescription || null,
        };

        const createdProcessResponse = await dispatch(createProcess(processPayload)).unwrap();
        createdProcessId = createdProcessResponse.data.id as number;

        if (!createdProcessId) {
          throw new Error('Created process has no id');
        }

        for (const phase of validation.data.phases) {
          const phasePayload: IPhase = {
            name: phase.name,
            description: phase.description || null,
            process: { id: createdProcessId },
          };
          await dispatch(createPhase(phasePayload)).unwrap();
        }
      }

      navigate(`/processos/${createdProcessId}`);
    } catch {
      setSubmitError(translate('processComposerApp.processDesign.wizard.submitError', 'Could not create the process. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const values = getValues();

  const selectedPhasesForConfirm = useMemo(() => {
    const selectedActivityIdSet = new Set(values.selectedActivityIds);
    const selectedEmptyPhaseIdSet = new Set(values.selectedEmptyPhaseIds);

    return activityTree
      .map(phase => {
        const selectedActivities = phase.activities.filter(activity => selectedActivityIdSet.has(activity.id));
        const isEmptyPhaseSelected = phase.activities.length === 0 && selectedEmptyPhaseIdSet.has(phase.id);

        if (selectedActivities.length === 0 && !isEmptyPhaseSelected) {
          return null;
        }

        return {
          id: phase.id,
          name: phase.name,
          activities: selectedActivities,
          isEmpty: isEmptyPhaseSelected,
        };
      })
      .filter((phase): phase is NonNullable<typeof phase> => phase !== null);
  }, [activityTree, values.selectedActivityIds, values.selectedEmptyPhaseIds]);

  return (
    <div className="process-wizard" data-cy="processWizard">
      <div className="process-wizard__header mb-4">
        <div>
          <h1 className="h2 mb-1">
            <Translate contentKey="processComposerApp.processDesign.wizard.title">New Process</Translate>
          </h1>
          <p className="text-muted mb-0">
            <Translate contentKey="processComposerApp.processDesign.wizard.subtitle">
              Define the process skeleton before modeling activities on the canvas
            </Translate>
          </p>
        </div>
        <Button tag={Link} to="/processos" color="link" className="p-0">
          <FontAwesomeIcon icon="arrow-left" /> <Translate contentKey="entity.action.back">Back</Translate>
        </Button>
      </div>

      <nav className="process-wizard__stepper mb-4" aria-label="wizard steps">
        <ol className="process-wizard__stepper-list">
          {WIZARD_STEPS.map((step, index) => (
            <li
              key={step.key}
              className={`process-wizard__step ${index === activeStep ? 'process-wizard__step--active' : ''} ${
                index < activeStep ? 'process-wizard__step--done' : ''
              }`}
            >
              <span className="process-wizard__step-index">{index + 1}</span>
              <Translate contentKey={step.labelKey}>{step.key}</Translate>
            </li>
          ))}
        </ol>
      </nav>

      <Form
        onSubmit={event => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        {activeStep === 0 && (
          <Card className="shadow-sm">
            <CardBody>
              <h2 className="h5 mb-3">
                <Translate contentKey="processComposerApp.processDesign.wizard.processStep.title">Process details</Translate>
              </h2>
              <div className="mb-3">
                <Label for="processName">
                  <Translate contentKey="processComposerApp.process.processName">Process Name</Translate>
                </Label>
                <Input
                  id="processName"
                  type="text"
                  invalid={Boolean(errors.processName)}
                  data-cy="processWizardName"
                  innerRef={processNameField.ref}
                  name={processNameField.name}
                  onChange={event => {
                    void processNameField.onChange(event);
                    if (errors.processName) {
                      clearErrors('processName');
                    }
                  }}
                  onBlur={event => {
                    void processNameField.onBlur(event);
                  }}
                />
                {errors.processName && (
                  <FormFeedback>
                    <Translate contentKey={errors.processName.message}>{errors.processName.message}</Translate>
                  </FormFeedback>
                )}
              </div>
              <div className="mb-0">
                <Label for="processDescription">
                  <Translate contentKey="processComposerApp.process.processDescription">Process Description</Translate>
                </Label>
                <Input
                  id="processDescription"
                  type="textarea"
                  rows={4}
                  data-cy="processWizardDescription"
                  innerRef={processDescriptionField.ref}
                  name={processDescriptionField.name}
                  onChange={event => {
                    void processDescriptionField.onChange(event);
                  }}
                  onBlur={event => {
                    void processDescriptionField.onBlur(event);
                  }}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {activeStep === 1 && (
          <Card className="shadow-sm">
            <CardBody>
              <h2 className="h5 mb-3">
                <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.title">Phases</Translate>
              </h2>

              <FormGroup tag="fieldset" className="mb-4">
                <legend className="form-label mb-2">
                  <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.creationModeLabel">
                    How do you want to define phases?
                  </Translate>
                </legend>
                <div className="d-flex flex-wrap gap-3">
                  <FormGroup check inline className="mb-0">
                    <Input
                      type="radio"
                      id="creationModeBlank"
                      value="blank"
                      checked={creationMode === 'blank'}
                      onChange={() => {
                        setValue('creationMode', 'blank', { shouldDirty: true });
                        if (getValues('phases').length === 0) {
                          setValue('phases', [{ name: '', description: '' }]);
                        }
                        clearErrors(['phases', 'sourceProcessId', 'selectedActivityIds']);
                      }}
                      data-cy="processWizardCreationModeBlank"
                    />
                    <Label check for="creationModeBlank">
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.creationModeBlank">
                        Create from scratch
                      </Translate>
                    </Label>
                  </FormGroup>
                  <FormGroup check inline className="mb-0">
                    <Input
                      type="radio"
                      id="creationModeFromProcess"
                      value="fromProcess"
                      checked={creationMode === 'fromProcess'}
                      onChange={() => {
                        setValue('creationMode', 'fromProcess', { shouldDirty: true });
                        setValue('phases', []);
                        clearErrors(['phases', 'sourceProcessId', 'selectedActivityIds']);
                      }}
                      data-cy="processWizardCreationModeFromProcess"
                    />
                    <Label check for="creationModeFromProcess">
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.creationModeFromProcess">
                        Clone from existing process
                      </Translate>
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>

              {creationMode === 'blank' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="text-muted small mb-0">
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.blankHint">
                        Add the phases that will structure this process.
                      </Translate>
                    </p>
                    <Button
                      type="button"
                      color="primary"
                      size="sm"
                      onClick={() => append({ name: '', description: '' })}
                      data-cy="addPhaseButton"
                    >
                      <FontAwesomeIcon icon="plus" />{' '}
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.addPhase">Add phase</Translate>
                    </Button>
                  </div>

                  {phasesError?.message && (
                    <Alert color="danger" className="py-2">
                      <Translate contentKey={phasesError.message}>{phasesError.message}</Translate>
                    </Alert>
                  )}

                  <ListGroup className="process-wizard__phase-list">
                    {fields.map((field, index) => {
                      const phaseNameField = register(`phases.${index}.name`);
                      const phaseDescriptionField = register(`phases.${index}.description`);

                      return (
                        <ListGroupItem key={field.id} className="process-wizard__phase-item">
                          <div className="process-wizard__phase-grid">
                            <span className="process-wizard__phase-position">{index + 1}</span>
                            <Label className="process-wizard__phase-name-label" for={`phase-name-${index}`}>
                              <Translate contentKey="processComposerApp.phase.name">Name</Translate>
                            </Label>
                            <Label className="process-wizard__phase-description-label" for={`phase-description-${index}`}>
                              <Translate contentKey="processComposerApp.phase.description">Description</Translate>
                            </Label>
                            <div className="btn-group-vertical btn-group-sm process-wizard__phase-move">
                              <Button
                                type="button"
                                color="light"
                                disabled={index === 0}
                                onClick={() => move(index, index - 1)}
                                aria-label={translate('processComposerApp.processDesign.wizard.phasesStep.moveUp', 'Move up')}
                                data-cy={`movePhaseUp-${index}`}
                              >
                                ▲
                              </Button>
                              <Button
                                type="button"
                                color="light"
                                disabled={index === fields.length - 1}
                                onClick={() => move(index, index + 1)}
                                aria-label={translate('processComposerApp.processDesign.wizard.phasesStep.moveDown', 'Move down')}
                                data-cy={`movePhaseDown-${index}`}
                              >
                                ▼
                              </Button>
                            </div>
                            <div className="process-wizard__phase-name">
                              <Input
                                id={`phase-name-${index}`}
                                type="text"
                                invalid={Boolean(errors.phases?.[index]?.name)}
                                data-cy={`phaseName-${index}`}
                                innerRef={phaseNameField.ref}
                                name={phaseNameField.name}
                                onChange={event => {
                                  void phaseNameField.onChange(event);
                                }}
                                onBlur={event => {
                                  void phaseNameField.onBlur(event);
                                }}
                              />
                              {errors.phases?.[index]?.name && (
                                <FormFeedback>
                                  <Translate contentKey={errors.phases[index].name.message}>{errors.phases[index].name.message}</Translate>
                                </FormFeedback>
                              )}
                            </div>
                            <div className="process-wizard__phase-description">
                              <Input
                                id={`phase-description-${index}`}
                                type="text"
                                data-cy={`phaseDescription-${index}`}
                                innerRef={phaseDescriptionField.ref}
                                name={phaseDescriptionField.name}
                                onChange={event => {
                                  void phaseDescriptionField.onChange(event);
                                }}
                                onBlur={event => {
                                  void phaseDescriptionField.onBlur(event);
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              color="danger"
                              outline
                              size="sm"
                              className="process-wizard__phase-remove"
                              disabled={fields.length === 1}
                              onClick={() => remove(index)}
                              data-cy={`removePhase-${index}`}
                            >
                              <FontAwesomeIcon icon="trash" />
                            </Button>
                          </div>
                        </ListGroupItem>
                      );
                    })}
                  </ListGroup>
                </>
              )}

              {creationMode === 'fromProcess' && (
                <>
                  <p className="text-muted small mb-3">
                    <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.fromProcessHint">
                      Select a source process and choose which phases and activities to clone into the new process.
                    </Translate>
                  </p>

                  {processesLoading && (
                    <div className="text-muted small mb-3">
                      <Spinner size="sm" className="me-2" />
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.loadingProcesses">
                        Loading processes...
                      </Translate>
                    </div>
                  )}

                  {!processesLoading && processes.length === 0 && (
                    <Alert color="warning" className="mb-3">
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.noProcesses">
                        No processes available. Create a process first or switch to manual phase creation.
                      </Translate>
                    </Alert>
                  )}

                  <div className="mb-4">
                    <Label for="sourceProcessId">
                      <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.sourceProcessLabel">
                        Source process
                      </Translate>
                    </Label>
                    <Input
                      id="sourceProcessId"
                      type="select"
                      invalid={Boolean(sourceProcessIdError)}
                      disabled={processesLoading || processes.length === 0}
                      data-cy="processWizardSourceProcessSelect"
                      innerRef={sourceProcessIdField.ref}
                      name={sourceProcessIdField.name}
                      onChange={event => {
                        void sourceProcessIdField.onChange(event);
                        if (sourceProcessIdError) {
                          clearErrors('sourceProcessId');
                        }
                      }}
                      onBlur={event => {
                        void sourceProcessIdField.onBlur(event);
                      }}
                    >
                      <option value="">
                        {translate('processComposerApp.processDesign.wizard.phasesStep.sourceProcessPlaceholder', 'Select a process...')}
                      </option>
                      {processes.map(process => (
                        <option key={process.id} value={process.id}>
                          {process.processName}
                        </option>
                      ))}
                    </Input>
                    {sourceProcessIdError && (
                      <FormFeedback>
                        <Translate contentKey={sourceProcessIdError.message}>{sourceProcessIdError.message}</Translate>
                      </FormFeedback>
                    )}
                  </div>

                  {selectedActivityIdsError?.message && (
                    <Alert color="danger" className="py-2">
                      <Translate contentKey={selectedActivityIdsError.message}>{selectedActivityIdsError.message}</Translate>
                    </Alert>
                  )}

                  <ActivitySelectionTree
                    phases={activityTree}
                    selectedActivityIds={selectedActivityIds}
                    selectedEmptyPhaseIds={selectedEmptyPhaseIds}
                    onChange={ids => {
                      setValue('selectedActivityIds', ids, { shouldDirty: true });
                      if (selectedActivityIdsError) {
                        clearErrors('selectedActivityIds');
                      }
                    }}
                    onEmptyPhaseIdsChange={ids => {
                      setValue('selectedEmptyPhaseIds', ids, { shouldDirty: true });
                      if (selectedActivityIdsError) {
                        clearErrors('selectedActivityIds');
                      }
                    }}
                    loading={treeLoading}
                  />

                  <p className="text-muted small mb-0 mt-3">
                    <Translate
                      contentKey="processComposerApp.processDesign.wizard.phasesStep.selectedCount"
                      interpolate={{ count: String(selectedCloneItemCount) }}
                    >
                      {`${selectedCloneItemCount} items selected`}
                    </Translate>
                  </p>
                </>
              )}
            </CardBody>
          </Card>
        )}

        {activeStep === 2 && (
          <Card className="shadow-sm">
            <CardBody>
              <h2 className="h5 mb-3">
                <Translate contentKey="processComposerApp.processDesign.wizard.confirmStep.title">Review and confirm</Translate>
              </h2>

              <div className="mb-4">
                <h3 className="h6 text-muted">
                  <Translate contentKey="processComposerApp.processDesign.wizard.confirmStep.process">Process</Translate>
                </h3>
                <p className="mb-1 fw-semibold">{values.processName}</p>
                <p className="text-muted mb-0">{values.processDescription || '—'}</p>
              </div>

              <div>
                <h3 className="h6 text-muted">
                  <Translate contentKey="processComposerApp.processDesign.wizard.confirmStep.phases">Phases</Translate>
                </h3>

                {values.creationMode === 'blank' && (
                  <ListGroup>
                    {values.phases.map((phase, index) => (
                      <ListGroupItem key={`${phase.name}-${index}`}>
                        <div className="fw-semibold">
                          {index + 1}. {phase.name}
                        </div>
                        {phase.description && <div className="text-muted small">{phase.description}</div>}
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                )}

                {values.creationMode === 'fromProcess' && (
                  <>
                    <p className="mb-2">
                      <span className="text-muted">
                        <Translate contentKey="processComposerApp.processDesign.wizard.confirmStep.sourceProcess">Source process</Translate>
                        :{' '}
                      </span>
                      <span className="fw-semibold">{sourceProcess?.processName ?? '—'}</span>
                    </p>
                    <ListGroup>
                      {selectedPhasesForConfirm.map((phase, index) => (
                        <ListGroupItem key={phase.id}>
                          <div className="fw-semibold">
                            {index + 1}. {phase.name}
                          </div>
                          {phase.isEmpty && (
                            <div className="text-muted small">
                              <Translate contentKey="processComposerApp.processDesign.wizard.confirmStep.emptyPhase">Empty phase</Translate>
                            </div>
                          )}
                          {phase.activities.length > 0 && (
                            <ul className="text-muted small mb-0 ps-3 mt-1">
                              {phase.activities.map(activity => (
                                <li key={activity.id}>{activity.name}</li>
                              ))}
                            </ul>
                          )}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {submitError && (
          <Alert color="danger" className="mt-3">
            {submitError}
          </Alert>
        )}

        <div className="process-wizard__actions mt-4 d-flex justify-content-between">
          <Button type="button" color="secondary" outline disabled={activeStep === 0 || submitting} onClick={goToPreviousStep}>
            <Translate contentKey="processComposerApp.processDesign.wizard.actions.previous">Previous</Translate>
          </Button>

          {activeStep < WIZARD_STEPS.length - 1 ? (
            <Button type="button" color="primary" onClick={goToNextStep} data-cy="wizardNextButton">
              <Translate contentKey="processComposerApp.processDesign.wizard.actions.next">Next</Translate>
            </Button>
          ) : (
            <Button type="submit" color="success" disabled={submitting} data-cy="wizardConfirmButton">
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  <Translate contentKey="processComposerApp.processDesign.wizard.actions.creating">Creating...</Translate>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="save" />{' '}
                  <Translate contentKey="processComposerApp.processDesign.wizard.actions.confirm">Create process</Translate>
                </>
              )}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default ProcessWizard;
