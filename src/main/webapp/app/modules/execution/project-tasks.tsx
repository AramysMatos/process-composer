import './project-tasks.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Button, Input, InputGroup, InputGroupText, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { getEntity as getProject } from 'app/entities/project/project.reducer';
import { deleteEntity as deleteTask, getEntities as getTasks } from 'app/entities/task/task.reducer';
import { TaskDetailPanel, TaskDetailPanelMode } from 'app/modules/execution/components/task-detail-panel';
import { isGitHubConnected } from 'app/modules/execution/execution.utils';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

const LIST_PAGE_SIZE = 20;
const NEW_TASK_ID = 'new';

export const ProjectTasks = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const [searchParams] = useSearchParams();

  const projectId = Number(id);
  const isValidProjectId = Number.isFinite(projectId) && projectId > 0;

  const project = useAppSelector(state => state.project.entity);
  const projectLoading = useAppSelector(state => state.project.loading);
  const taskEntities = useAppSelector(state => state.task.entities);
  const tasksLoading = useAppSelector(state => state.task.loading);
  const taskEntity = useAppSelector(state => state.task.entity);
  const taskUpdating = useAppSelector(state => state.task.updating);
  const updateSuccess = useAppSelector(state => state.task.updateSuccess);

  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [panelMode, setPanelMode] = useState<TaskDetailPanelMode>('view');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedTaskParam = searchParams.get('task');
  const isCreating = selectedTaskParam === NEW_TASK_ID;
  const selectedTaskId = selectedTaskParam && selectedTaskParam !== NEW_TASK_ID ? Number(selectedTaskParam) : undefined;
  const hasValidSelection = isCreating || (selectedTaskId !== undefined && Number.isFinite(selectedTaskId) && selectedTaskId > 0);

  useEffect(() => {
    if (!isValidProjectId) {
      return;
    }

    dispatch(getProject(projectId));
    dispatch(getTasks({ eagerload: true }));
    dispatch(getPhases({}));
    dispatch(getActivities({}));
  }, [dispatch, isValidProjectId, projectId]);

  const projectMatches = project.id === projectId;
  const projectName = project.name ?? translate('processComposerApp.execution.overview.loadingProject', 'Loading...');
  const processId = project.process?.id;
  const githubConnected = projectMatches && isGitHubConnected(project);

  const projectTasks = useMemo(
    () =>
      isValidProjectId
        ? [...taskEntities.filter(task => task.project?.id === projectId)].sort((left, right) => (right.id ?? 0) - (left.id ?? 0))
        : [],
    [isValidProjectId, projectId, taskEntities]
  );

  const trimmedSearch = searchQuery.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    if (!trimmedSearch) {
      return projectTasks;
    }

    return projectTasks.filter(task => {
      const name = task.name?.toLowerCase() ?? '';
      const description = task.description?.toLowerCase() ?? '';
      return name.includes(trimmedSearch) || description.includes(trimmedSearch);
    });
  }, [projectTasks, trimmedSearch]);

  const displayedTasks = useMemo(() => {
    const start = (activePage - 1) * LIST_PAGE_SIZE;
    return filteredTasks.slice(start, start + LIST_PAGE_SIZE);
  }, [activePage, filteredTasks]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) {
      return null;
    }
    return projectTasks.find(task => task.id === selectedTaskId) ?? null;
  }, [projectTasks, selectedTaskId]);

  const detailTask = isCreating ? null : selectedTask;

  useEffect(() => {
    setActivePage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    if (isCreating) {
      setPanelMode('edit');
      return;
    }
    setPanelMode('view');
  }, [isCreating, selectedTaskId]);

  useEffect(() => {
    if (!updateSuccess) {
      return;
    }

    if (deleteModalOpen) {
      setDeleteModalOpen(false);
      navigate(`/projetos/${projectId}/tarefas`);
      dispatch(getTasks({ eagerload: true }));
      return;
    }

    if (isCreating && taskEntity?.id) {
      navigate(`/projetos/${projectId}/tarefas?task=${taskEntity.id}`);
      dispatch(getTasks({ eagerload: true }));
    } else if (!isCreating) {
      dispatch(getTasks({ eagerload: true }));
    }
  }, [deleteModalOpen, dispatch, isCreating, navigate, projectId, taskEntity?.id, updateSuccess]);

  const handleSelectTask = useCallback(
    (taskId: number | typeof NEW_TASK_ID | undefined) => {
      if (taskId === undefined) {
        navigate(`/projetos/${projectId}/tarefas`);
        return;
      }
      navigate(`/projetos/${projectId}/tarefas?task=${taskId}`);
    },
    [navigate, projectId]
  );

  const handleDelete = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (!deleting) {
      setDeleteModalOpen(false);
    }
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTask?.id) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteTask(selectedTask.id)).unwrap();
    } catch {
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [dispatch, selectedTask?.id]);

  const loading = projectLoading || tasksLoading;

  if (!isValidProjectId) {
    return (
      <div className="project-tasks" data-cy="project-tasks">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.execution.overview.invalidProjectId">Invalid project id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="project-tasks" data-cy="project-tasks">
      <header className="project-tasks__header">
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
            { label: translate('processComposerApp.execution.tasks.breadcrumbTasks', 'Tasks') },
          ]}
          data-cy="project-tasks-breadcrumb"
        />
      </header>

      <h1 className="h2 mb-4">
        <Translate contentKey="processComposerApp.execution.tasks.title">Project tasks</Translate>
      </h1>

      {loading && (
        <div className="project-tasks__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!loading && !projectMatches && (
        <Alert color="warning">
          <Translate contentKey="processComposerApp.execution.overview.projectNotFound">Project not found</Translate>
        </Alert>
      )}

      {!loading && projectMatches && (
        <div className="project-tasks__master-detail" data-cy="project-tasks-master-detail">
          <section className="project-tasks__master" aria-label={translate('processComposerApp.library.masterList', 'Master list')}>
            <div className="project-tasks__master-header">
              <InputGroup>
                <InputGroupText>
                  <FontAwesomeIcon icon="search" />
                </InputGroupText>
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
                  aria-label={translate('processComposerApp.library.searchPlaceholder', 'Search by name...')}
                  data-cy="project-tasks-search"
                />
              </InputGroup>
              <Button color="primary" size="sm" onClick={() => handleSelectTask(NEW_TASK_ID)} data-cy="createTaskButton">
                <FontAwesomeIcon icon="plus" /> <Translate contentKey="processComposerApp.execution.tasks.createButton">New task</Translate>
              </Button>
            </div>

            {projectTasks.length === 0 && (
              <div className="alert alert-warning m-3 mb-0" data-cy="project-tasks-empty">
                <Translate contentKey="processComposerApp.execution.tasks.empty">
                  No tasks yet. Create the first one for this project.
                </Translate>
              </div>
            )}

            {projectTasks.length > 0 && filteredTasks.length === 0 && (
              <div className="alert alert-warning m-3 mb-0" data-cy="project-tasks-not-found">
                <Translate contentKey="processComposerApp.library.notFound">No items found</Translate>
              </div>
            )}

            {displayedTasks.length > 0 && (
              <div className="project-tasks__list" data-cy="project-tasks-list">
                {displayedTasks.map(task => {
                  const isSelected = task.id === selectedTaskId;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className={`project-tasks__list-item${isSelected ? ' project-tasks__list-item--selected' : ''}`}
                      onClick={() => task.id && handleSelectTask(task.id)}
                      data-cy={`project-task-row-${task.id}`}
                    >
                      <span className="project-tasks__list-item-name">{task.name}</span>
                      {task.description && <span className="project-tasks__list-item-description">{task.description}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredTasks.length > LIST_PAGE_SIZE && (
              <div className="p-3 border-top">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <JhiItemCount page={activePage} total={filteredTasks.length} itemsPerPage={LIST_PAGE_SIZE} i18nEnabled />
                  <JhiPagination
                    activePage={activePage}
                    onSelect={setActivePage}
                    maxButtons={5}
                    itemsPerPage={LIST_PAGE_SIZE}
                    totalItems={filteredTasks.length}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="project-tasks__detail" aria-label={translate('processComposerApp.library.detailPanel', 'Detail panel')}>
            {!hasValidSelection ? (
              <div className="project-tasks__detail-empty" data-cy="project-tasks-detail-empty">
                <Translate contentKey="processComposerApp.execution.tasks.selectTask">
                  Select a task from the list or create a new one
                </Translate>
              </div>
            ) : selectedTaskId && !isCreating && !selectedTask ? (
              <div className="project-tasks__detail-empty" data-cy="project-tasks-not-found">
                <Translate contentKey="processComposerApp.execution.tasks.notFound">Task not found</Translate>
              </div>
            ) : (
              <TaskDetailPanel
                task={detailTask}
                isCreating={isCreating}
                projectId={projectId}
                processId={processId}
                githubConnected={githubConnected}
                mode={panelMode}
                onModeChange={setPanelMode}
                onDelete={handleDelete}
                onCancelCreate={() => handleSelectTask(undefined)}
                onTaskPublished={() => dispatch(getTasks({ eagerload: true }))}
              />
            )}
          </section>
        </div>
      )}

      <Modal isOpen={deleteModalOpen} toggle={handleCancelDelete}>
        <ModalHeader toggle={handleCancelDelete} data-cy="project-task-delete-dialog-heading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.execution.tasks.delete.confirm" interpolate={{ name: selectedTask?.name ?? '' }}>
            {`Are you sure you want to delete the task "${selectedTask?.name ?? ''}"?`}
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelDelete} disabled={deleting || taskUpdating}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button
            color="danger"
            onClick={() => void handleConfirmDelete()}
            disabled={deleting || taskUpdating}
            data-cy="project-task-confirm-delete-button"
          >
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectTasks;
