import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity as getProject } from 'app/entities/project/project.reducer';
import { getEntities as getTasks } from 'app/entities/task/task.reducer';
import { GithubConnectModal } from 'app/modules/execution/components/github-connect-modal';
import { GithubStatusCard } from 'app/modules/execution/components/github-status-card';
import { IssuePreviewList } from 'app/modules/execution/components/issue-preview-list';
import { generateGithubIssuePreviews, GithubIssuePreview } from 'app/modules/execution/execution.reducer';
import { isGitHubConnected } from 'app/modules/execution/execution.utils';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

export const ProjectGithub = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const projectId = Number(id);
  const isValidProjectId = Number.isFinite(projectId) && projectId > 0;

  const project = useAppSelector(state => state.project.entity);
  const projectLoading = useAppSelector(state => state.project.loading);
  const taskEntities = useAppSelector(state => state.task.entities);
  const tasksLoading = useAppSelector(state => state.task.loading);
  const executionLoading = useAppSelector(state => state.execution.loading);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [issuePreviews, setIssuePreviews] = useState<GithubIssuePreview[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidProjectId) {
      return;
    }

    dispatch(getProject(projectId));
    dispatch(getTasks({ eagerload: true }));
  }, [dispatch, isValidProjectId, projectId]);

  const projectMatches = project.id === projectId;
  const projectName = project.name ?? translate('processComposerApp.execution.overview.loadingProject', 'Loading...');
  const connected = projectMatches && isGitHubConnected(project);

  const projectTasks = useMemo(
    () =>
      isValidProjectId
        ? [...taskEntities.filter(task => task.project?.id === projectId)].sort((left, right) => (left.id ?? 0) - (right.id ?? 0))
        : [],
    [isValidProjectId, projectId, taskEntities]
  );

  const handleOpenConnectModal = useCallback(() => {
    setConnectModalOpen(true);
  }, []);

  const handleCloseConnectModal = useCallback(() => {
    setConnectModalOpen(false);
  }, []);

  const handleConnected = useCallback(async () => {
    if (isValidProjectId) {
      await dispatch(getProject(projectId));
    }
    toast.success(translate('processComposerApp.execution.github.status.connectSuccess', 'GitHub connected successfully.'));
  }, [dispatch, isValidProjectId, projectId]);

  const handleGenerateBacklog = async () => {
    setGenerateError(null);

    if (projectTasks.length === 0) {
      setGenerateError(translate('processComposerApp.execution.github.generate.noTasks', 'Create tasks before generating the backlog.'));
      return;
    }

    try {
      const previews = await dispatch(generateGithubIssuePreviews(projectTasks)).unwrap();
      setIssuePreviews(previews);
    } catch (error: unknown) {
      const message =
        (error as Error)?.message ?? translate('processComposerApp.execution.github.generate.error', 'Failed to generate issue previews.');
      setGenerateError(message);
      toast.error(message);
    }
  };

  const handlePublished = useCallback(() => {
    dispatch(getTasks({ eagerload: true }));
    setIssuePreviews([]);
  }, [dispatch]);

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

      {(projectLoading || tasksLoading) && (
        <div className="text-center py-4">
          <Spinner color="primary" />
        </div>
      )}

      {!projectLoading && projectMatches && (
        <>
          <GithubStatusCard project={project} onConnect={handleOpenConnectModal} onReconnect={handleOpenConnectModal} />

          <section className="mt-4">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
              <div>
                <h2 className="h5 mb-1">
                  <Translate contentKey="processComposerApp.execution.github.generate.title">Automatic backlog</Translate>
                </h2>
                <p className="text-muted mb-0">
                  <Translate contentKey="processComposerApp.execution.github.generate.hint">
                    Generate one GitHub issue preview for each project task.
                  </Translate>
                </p>
              </div>
              <Button
                color="primary"
                disabled={!connected || executionLoading || projectTasks.length === 0}
                onClick={() => void handleGenerateBacklog()}
                data-cy="github-generate-backlog-button"
              >
                {executionLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FontAwesomeIcon icon="magic" className="me-2" aria-hidden="true" />
                    <Translate contentKey="processComposerApp.execution.github.generate.button">Generate backlog automatically</Translate>
                  </>
                )}
              </Button>
            </div>

            {!connected && (
              <Alert color="info" data-cy="github-generate-disabled-hint">
                <Translate contentKey="processComposerApp.execution.github.generate.connectFirst">
                  Connect the project to GitHub before generating the backlog.
                </Translate>
              </Alert>
            )}

            {generateError && (
              <Alert color="danger" className="mb-3" data-cy="github-generate-error">
                {generateError}
              </Alert>
            )}
          </section>

          {issuePreviews.length > 0 && (
            <IssuePreviewList previews={issuePreviews} projectId={projectId} tasks={projectTasks} onPublished={handlePublished} />
          )}
        </>
      )}

      <GithubConnectModal isOpen={connectModalOpen} project={project} onClose={handleCloseConnectModal} onConnected={handleConnected} />
    </div>
  );
};

export default ProjectGithub;
