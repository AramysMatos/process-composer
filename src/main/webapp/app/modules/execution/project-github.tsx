import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity as getProject } from 'app/entities/project/project.reducer';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

export const ProjectGithub = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const projectId = Number(id);
  const isValidProjectId = Number.isFinite(projectId) && projectId > 0;

  const project = useAppSelector(state => state.project.entity);
  const projectLoading = useAppSelector(state => state.project.loading);

  useEffect(() => {
    if (!isValidProjectId) {
      return;
    }

    dispatch(getProject(projectId));
  }, [dispatch, isValidProjectId, projectId]);

  const projectMatches = project.id === projectId;
  const projectName = project.name ?? translate('processComposerApp.execution.overview.loadingProject', 'Loading...');

  if (!isValidProjectId) {
    return (
      <div className="project-github" data-cy="project-github">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.execution.overview.invalidProjectId">Invalid project id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="project-github" data-cy="project-github">
      <header className="mb-3">
        <Breadcrumb
          items={[
            {
              label: translate('processComposerApp.execution.overview.breadcrumbProjects', 'Projects'),
              path: '/projetos',
            },
            {
              label: projectMatches ? projectName : translate('processComposerApp.execution.overview.loadingProject', 'Loading...'),
              path: `/projetos/${projectId}`,
            },
            { label: translate('processComposerApp.execution.overview.nav.github.title', 'GitHub') },
          ]}
          data-cy="project-github-breadcrumb"
        />
      </header>

      {projectLoading && (
        <div className="text-center py-4">
          <Spinner color="primary" />
        </div>
      )}

      {!projectLoading && projectMatches && (
        <Alert color="info">
          <Translate contentKey="processComposerApp.execution.github.placeholder">
            GitHub integration panel — connect the repository and generate issues from tasks.
          </Translate>
        </Alert>
      )}
    </div>
  );
};

export default ProjectGithub;
