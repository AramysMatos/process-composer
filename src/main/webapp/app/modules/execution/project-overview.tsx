import './project-overview.scss';

import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity as getProject } from 'app/entities/project/project.reducer';
import { getEntities as getTasks } from 'app/entities/task/task.reducer';
import { ExecutionInsightsPanel } from 'app/modules/execution/execution-insights-panel';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

export const ProjectOverview = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const projectId = Number(id);
  const isValidProjectId = Number.isFinite(projectId) && projectId > 0;

  const project = useAppSelector(state => state.project.entity);
  const projectLoading = useAppSelector(state => state.project.loading);
  const tasksLoading = useAppSelector(state => state.task.loading);

  useEffect(() => {
    if (!isValidProjectId) {
      return;
    }

    dispatch(getProject(projectId));
    dispatch(getTasks({ eagerload: true }));
  }, [dispatch, isValidProjectId, projectId]);

  const projectMatches = project.id === projectId;
  const projectName = project.name ?? translate('processComposerApp.execution.overview.loadingProject', 'Loading...');

  const loading = projectLoading || tasksLoading;
  const processId = project.process?.id;
  const processName = project.process?.processName;

  if (!isValidProjectId) {
    return (
      <div className="project-overview" data-cy="project-overview">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.execution.overview.invalidProjectId">Invalid project id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="project-overview" data-cy="project-overview">
      <header className="project-overview__header">
        <Breadcrumb
          items={[
            {
              label: translate('processComposerApp.execution.overview.breadcrumbProjects', 'Projects'),
              path: '/projetos',
            },
            { label: projectMatches ? projectName : translate('processComposerApp.execution.overview.loadingProject', 'Loading...') },
          ]}
          data-cy="project-overview-breadcrumb"
        />
      </header>

      {loading && (
        <div className="project-overview__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!loading && !projectMatches && (
        <Alert color="warning">
          <Translate contentKey="processComposerApp.execution.overview.projectNotFound">Project not found</Translate>
        </Alert>
      )}

      {!loading && projectMatches && (
        <>
          <div className="project-overview__title-row">
            <h1 className="h2 mb-0">{project.name}</h1>
          </div>

          {project.description && <p className="project-overview__description">{project.description}</p>}

          <p className="project-overview__source">
            <Translate contentKey="processComposerApp.execution.overview.instantiatedFrom">Instantiated from</Translate>:{' '}
            {processId && processName ? (
              <Link to={`/processos/${processId}`} className="project-overview__source-link" data-cy="project-source-process-link">
                {processName}
              </Link>
            ) : (
              <span className="text-muted">—</span>
            )}
          </p>

          <section
            className="project-overview__nav-grid"
            aria-label={translate('processComposerApp.execution.overview.navigationAria', 'Project sections')}
          >
            <Link to={`/projetos/${projectId}/tarefas`} className="project-overview__nav-card shadow-sm" data-cy="project-nav-tasks">
              <span className="project-overview__nav-icon" aria-hidden="true">
                <FontAwesomeIcon icon="tasks" />
              </span>
              <span className="project-overview__nav-title">
                <Translate contentKey="processComposerApp.execution.overview.nav.tasks.title">Tasks</Translate>
              </span>
              <p className="project-overview__nav-description">
                <Translate contentKey="processComposerApp.execution.overview.nav.tasks.description">
                  Manage project tasks and link them to process activities.
                </Translate>
              </p>
            </Link>

            <Link to={`/projetos/${projectId}/github`} className="project-overview__nav-card shadow-sm" data-cy="project-nav-github">
              <span className="project-overview__nav-icon" aria-hidden="true">
                <FontAwesomeIcon icon="cloud" />
              </span>
              <span className="project-overview__nav-title">
                <Translate contentKey="processComposerApp.execution.overview.nav.github.title">GitHub</Translate>
              </span>
              <p className="project-overview__nav-description">
                <Translate contentKey="processComposerApp.execution.overview.nav.github.description">
                  Connect the repository and generate issues from tasks.
                </Translate>
              </p>
            </Link>
          </section>

          <ExecutionInsightsPanel projectId={projectId} processId={processId} />
        </>
      )}
    </div>
  );
};

export default ProjectOverview;
