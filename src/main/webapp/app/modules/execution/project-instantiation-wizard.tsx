import './project-instantiation-wizard.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Alert, Button, Card, CardBody, Form, FormFeedback, Input, Label, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { createEntity as createProject } from 'app/entities/project/project.reducer';
import { IProject } from 'app/shared/model/project.model';
import { ProjectWizardFormValues, projectWizardSchema, projectWizardStep1Schema } from './dto';

const WIZARD_STEPS = [
  { key: 'process', labelKey: 'processComposerApp.execution.wizard.steps.process' },
  { key: 'confirm', labelKey: 'processComposerApp.execution.wizard.steps.confirm' },
] as const;

const applyZodErrors = (
  setError: ReturnType<typeof useForm<ProjectWizardFormValues>>['setError'],
  error: { issues: Array<{ path: (string | number)[]; message: string }> }
) => {
  error.issues.forEach(issue => {
    const fieldPath = issue.path[0];
    if (fieldPath === 'processId' || fieldPath === 'projectName' || fieldPath === 'projectDescription') {
      setError(fieldPath, { type: 'manual', message: issue.message });
    }
  });
};

export const ProjectInstantiationWizard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedProcessId = searchParams.get('processId');
  const parsedPreselectedProcessId = preselectedProcessId ? Number(preselectedProcessId) : undefined;

  const processes = useAppSelector(state => state.process.entities);
  const processesLoading = useAppSelector(state => state.process.loading);

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectWizardFormValues>({
    mode: 'onTouched',
    defaultValues: {
      processId: Number.isFinite(parsedPreselectedProcessId) ? parsedPreselectedProcessId : undefined,
      projectName: '',
      projectDescription: '',
    },
  });

  const processIdField = register('processId', { valueAsNumber: true });
  const projectNameField = register('projectName');
  const projectDescriptionField = register('projectDescription');

  const selectedProcessId = watch('processId');

  const selectedProcess = useMemo(() => processes.find(process => process.id === selectedProcessId), [processes, selectedProcessId]);

  useEffect(() => {
    dispatch(getProcesses({}));
  }, [dispatch]);

  useEffect(() => {
    if (Number.isFinite(parsedPreselectedProcessId) && processes.some(process => process.id === parsedPreselectedProcessId)) {
      setValue('processId', parsedPreselectedProcessId);
    }
  }, [parsedPreselectedProcessId, processes, setValue]);

  const goToNextStep = () => {
    clearErrors();
    const values = getValues();

    if (activeStep === 0) {
      const result = projectWizardStep1Schema.safeParse(values);
      if (!result.success) {
        applyZodErrors(setError, result.error);
        return;
      }
      setActiveStep(1);
    }
  };

  const goToPreviousStep = () => {
    clearErrors();
    setActiveStep(current => Math.max(0, current - 1));
  };

  const values = getValues();

  const onSubmit = async (data: ProjectWizardFormValues) => {
    const validation = projectWizardSchema.safeParse(data);
    if (!validation.success) {
      applyZodErrors(setError, validation.error);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const projectPayload: IProject = {
        name: validation.data.projectName,
        description: validation.data.projectDescription || null,
        process: { id: validation.data.processId },
      };

      const createdProjectResponse = await dispatch(createProject(projectPayload)).unwrap();
      const createdProjectId = createdProjectResponse.data.id;

      if (!createdProjectId) {
        throw new Error('Created project has no id');
      }

      navigate(`/projetos/${createdProjectId}`);
    } catch {
      setSubmitError(translate('processComposerApp.execution.wizard.submitError', 'Could not create the project. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="project-instantiation-wizard" data-cy="projectInstantiationWizard">
      <div className="project-instantiation-wizard__header mb-4">
        <div>
          <h1 className="h2 mb-1">
            <Translate contentKey="processComposerApp.execution.wizard.title">New Project</Translate>
          </h1>
          <p className="text-muted mb-0">
            <Translate contentKey="processComposerApp.execution.wizard.subtitle">
              Create an empty project linked to a process definition. Tasks are added later on the tasks screen.
            </Translate>
          </p>
        </div>
        <Button tag={Link} to="/" color="link" className="p-0">
          <FontAwesomeIcon icon="arrow-left" /> <Translate contentKey="entity.action.back">Back</Translate>
        </Button>
      </div>

      <nav className="project-instantiation-wizard__stepper mb-4" aria-label="wizard steps">
        <ol className="project-instantiation-wizard__stepper-list">
          {WIZARD_STEPS.map((step, index) => (
            <li
              key={step.key}
              className={`project-instantiation-wizard__step ${index === activeStep ? 'project-instantiation-wizard__step--active' : ''} ${
                index < activeStep ? 'project-instantiation-wizard__step--done' : ''
              }`}
            >
              <span className="project-instantiation-wizard__step-index">{index + 1}</span>
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
              <h2 className="h5 mb-2">
                <Translate contentKey="processComposerApp.execution.wizard.processStep.title">Choose the source process</Translate>
              </h2>
              <p className="text-muted small mb-3">
                <Translate contentKey="processComposerApp.execution.wizard.processStep.hint">
                  The project will reference this process. You can create tasks from its activities individually later.
                </Translate>
              </p>

              {processesLoading && (
                <div className="text-muted small mb-3">
                  <Spinner size="sm" className="me-2" />
                  <Translate contentKey="processComposerApp.execution.wizard.processStep.loadingProcesses">Loading processes...</Translate>
                </div>
              )}

              {!processesLoading && processes.length === 0 && (
                <Alert color="warning" className="mb-3">
                  <Translate contentKey="processComposerApp.execution.wizard.processStep.noProcesses">
                    No processes available. Create a process first.
                  </Translate>
                </Alert>
              )}

              <div className="mb-0">
                <Label for="processId">
                  <Translate contentKey="processComposerApp.execution.wizard.processStep.selectLabel">Process</Translate>
                </Label>
                <Input
                  id="processId"
                  type="select"
                  invalid={Boolean(errors.processId)}
                  disabled={processesLoading || processes.length === 0}
                  data-cy="projectWizardProcessSelect"
                  innerRef={processIdField.ref}
                  name={processIdField.name}
                  onChange={event => {
                    void processIdField.onChange(event);
                    if (errors.processId) {
                      clearErrors('processId');
                    }
                  }}
                  onBlur={event => {
                    void processIdField.onBlur(event);
                  }}
                >
                  <option value="">
                    {translate('processComposerApp.execution.wizard.processStep.selectPlaceholder', 'Select a process...')}
                  </option>
                  {processes.map(process => (
                    <option key={process.id} value={process.id}>
                      {process.processName}
                    </option>
                  ))}
                </Input>
                {errors.processId && (
                  <FormFeedback>
                    <Translate contentKey={errors.processId.message}>{errors.processId.message}</Translate>
                  </FormFeedback>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {activeStep === 1 && (
          <>
            <Card className="shadow-sm mb-3">
              <CardBody>
                <h2 className="h5 mb-3">
                  <Translate contentKey="processComposerApp.execution.wizard.confirmStep.title">Project details</Translate>
                </h2>

                <div className="mb-3">
                  <Label for="projectName">
                    <Translate contentKey="processComposerApp.project.name">Name</Translate>
                  </Label>
                  <Input
                    id="projectName"
                    type="text"
                    invalid={Boolean(errors.projectName)}
                    data-cy="projectWizardName"
                    innerRef={projectNameField.ref}
                    name={projectNameField.name}
                    onChange={event => {
                      void projectNameField.onChange(event);
                      if (errors.projectName) {
                        clearErrors('projectName');
                      }
                    }}
                    onBlur={event => {
                      void projectNameField.onBlur(event);
                    }}
                  />
                  {errors.projectName && (
                    <FormFeedback>
                      <Translate contentKey={errors.projectName.message}>{errors.projectName.message}</Translate>
                    </FormFeedback>
                  )}
                </div>

                <div className="mb-0">
                  <Label for="projectDescription">
                    <Translate contentKey="processComposerApp.project.description">Description</Translate>
                  </Label>
                  <Input
                    id="projectDescription"
                    type="textarea"
                    rows={4}
                    data-cy="projectWizardDescription"
                    innerRef={projectDescriptionField.ref}
                    name={projectDescriptionField.name}
                    onChange={event => {
                      void projectDescriptionField.onChange(event);
                    }}
                    onBlur={event => {
                      void projectDescriptionField.onBlur(event);
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardBody>
                <h2 className="h5 mb-3">
                  <Translate contentKey="processComposerApp.execution.wizard.confirmStep.summaryTitle">Review and confirm</Translate>
                </h2>

                <div className="mb-3">
                  <div className="project-instantiation-wizard__summary-label">
                    <Translate contentKey="processComposerApp.execution.wizard.confirmStep.process">Source process</Translate>
                  </div>
                  <p className="mb-0 fw-semibold">{selectedProcess?.processName ?? '—'}</p>
                  {selectedProcess?.processDescription && <p className="text-muted small mb-0">{selectedProcess.processDescription}</p>}
                </div>

                <div>
                  <div className="project-instantiation-wizard__summary-label">
                    <Translate contentKey="processComposerApp.execution.wizard.confirmStep.project">Project</Translate>
                  </div>
                  <p className="mb-0 fw-semibold">{values.projectName || '—'}</p>
                  <p className="text-muted small mb-0">{values.projectDescription || '—'}</p>
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {submitError && (
          <Alert color="danger" className="mt-3">
            {submitError}
          </Alert>
        )}

        <div className="project-instantiation-wizard__actions mt-4 d-flex justify-content-between">
          <Button type="button" color="secondary" outline disabled={activeStep === 0 || submitting} onClick={goToPreviousStep}>
            <Translate contentKey="processComposerApp.execution.wizard.actions.previous">Previous</Translate>
          </Button>

          {activeStep < WIZARD_STEPS.length - 1 ? (
            <Button type="button" color="primary" onClick={goToNextStep} data-cy="projectWizardNextButton">
              <Translate contentKey="processComposerApp.execution.wizard.actions.next">Next</Translate>
            </Button>
          ) : (
            <Button type="submit" color="success" disabled={submitting} data-cy="projectWizardConfirmButton">
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  <Translate contentKey="processComposerApp.execution.wizard.actions.creating">Creating...</Translate>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon="save" />{' '}
                  <Translate contentKey="processComposerApp.execution.wizard.actions.confirm">Create project</Translate>
                </>
              )}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default ProjectInstantiationWizard;
