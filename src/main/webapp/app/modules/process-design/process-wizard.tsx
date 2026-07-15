import './process-wizard.scss';
import { FieldError } from 'react-hook-form';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { Alert, Button, Card, CardBody, Col, Form, FormFeedback, Input, Label, ListGroup, ListGroupItem, Row, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch } from 'app/config/store';
import { createEntity as createProcess } from 'app/entities/process/process.reducer';
import { createEntity as createPhase } from 'app/entities/phase/phase.reducer';
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
    setError(fieldPath as 'processName' | 'processDescription' | 'phases' | `phases.${number}.name` | `phases.${number}.description`, {
      type: 'manual',
      message: issue.message,
    });
  });
};

export const ProcessWizard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProcessWizardFormValues>({
    mode: 'onTouched',
    defaultValues: {
      processName: '',
      processDescription: '',
      phases: [{ name: '', description: '' }],
    },
  });

  const processNameField = register('processName');
  const processDescriptionField = register('processDescription');

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'phases',
  });

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

  const onSubmit = async (data: ProcessWizardFormValues) => {
    const validation = processWizardSchema.safeParse(data);
    if (!validation.success) {
      applyZodErrors(setError, validation.error);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const processPayload: IProcess = {
        processName: validation.data.processName,
        processDescription: validation.data.processDescription || null,
      };

      const createdProcessResponse = await dispatch(createProcess(processPayload)).unwrap();
      const createdProcessId = createdProcessResponse.data.id;

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

      navigate(`/processos/${createdProcessId}`);
    } catch (error) {
      setSubmitError(translate('processComposerApp.processDesign.wizard.submitError', 'Could not create the process. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const values = getValues();

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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">
                  <Translate contentKey="processComposerApp.processDesign.wizard.phasesStep.title">Phases</Translate>
                </h2>
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
                      <div className="process-wizard__phase-order">
                        <span className="process-wizard__phase-position">{index + 1}</span>
                        <div className="btn-group-vertical btn-group-sm">
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
                      </div>
                      <div className="flex-grow-1">
                        <Row className="g-3">
                          <Col md={5}>
                            <Label for={`phase-name-${index}`}>
                              <Translate contentKey="processComposerApp.phase.name">Name</Translate>
                            </Label>
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
                          </Col>
                          <Col md={7}>
                            <Label for={`phase-description-${index}`}>
                              <Translate contentKey="processComposerApp.phase.description">Description</Translate>
                            </Label>
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
                          </Col>
                        </Row>
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
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
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
