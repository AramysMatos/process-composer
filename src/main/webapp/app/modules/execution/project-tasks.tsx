import './project-tasks.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { getEntity as getProject } from 'app/entities/project/project.reducer';
import { deleteEntity as deleteTask, getEntities as getTasks } from 'app/entities/task/task.reducer';
import { CreateTaskModal } from 'app/modules/execution/components/create-task-modal';
import { TaskActivityChips } from 'app/modules/execution/components/task-activity-chips';
import { EntityDeleteButton } from 'app/modules/process-design/components/entity-delete-button';
import { ITask } from 'app/shared/model/task.model';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

const columnHelper = createColumnHelper<ITask>();

type TaskDeleteTarget = {
  id: number;
  name: string;
};

export const ProjectTasks = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const projectId = Number(id);
  const isValidProjectId = Number.isFinite(projectId) && projectId > 0;

  const project = useAppSelector(state => state.project.entity);
  const projectLoading = useAppSelector(state => state.project.loading);
  const taskEntities = useAppSelector(state => state.task.entities);
  const tasksLoading = useAppSelector(state => state.task.loading);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ITask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const taskUpdating = useAppSelector(state => state.task.updating);

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

  const projectTasks = useMemo(
    () =>
      isValidProjectId
        ? [...taskEntities.filter(task => task.project?.id === projectId)].sort((left, right) => (right.id ?? 0) - (left.id ?? 0))
        : [],
    [isValidProjectId, projectId, taskEntities]
  );

  const handleRequestEdit = useCallback((task: ITask) => {
    setEditTarget(task);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setCreateModalOpen(false);
    setEditTarget(null);
  }, []);

  const handleRequestDelete = useCallback((task: ITask) => {
    if (!task.id) {
      return;
    }
    setDeleteTarget({ id: task.id, name: task.name ?? '' });
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteTask(deleteTarget.id)).unwrap();
      dispatch(getTasks({ eagerload: true }));
      setDeleteTarget(null);
    } catch {
      // Modal stays open so the user can retry or cancel.
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: () => translate('processComposerApp.task.name', 'Name'),
        cell: info => info.getValue() ?? '—',
      }),
      columnHelper.accessor('description', {
        id: 'description',
        header: () => translate('processComposerApp.task.description', 'Description'),
        cell: info => {
          const value = info.getValue();
          if (!value) {
            return <span className="text-muted">—</span>;
          }
          return <p className="project-tasks__description mb-0">{value}</p>;
        },
      }),
      columnHelper.display({
        id: 'activities',
        header: () => translate('processComposerApp.execution.tasks.linkedActivitiesColumn', 'Linked activities'),
        cell: ({ row }) => <TaskActivityChips task={row.original} processId={processId} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => '',
        cell: ({ row }) => {
          const task = row.original;
          if (!task.id) {
            return null;
          }

          return (
            <div className="project-tasks__row-actions">
              <button
                type="button"
                className="project-tasks__edit-button"
                aria-label={translate('processComposerApp.execution.tasks.editTask', 'Edit task')}
                disabled={deleting || taskUpdating}
                data-cy={`edit-task-${task.id}`}
                onClick={event => {
                  event.stopPropagation();
                  handleRequestEdit(task);
                }}
              >
                <FontAwesomeIcon icon="pencil-alt" />
              </button>
              <EntityDeleteButton
                label={translate('processComposerApp.execution.tasks.deleteTask', 'Delete task')}
                onClick={() => handleRequestDelete(task)}
                disabled={deleting || taskUpdating}
                data-cy={`delete-task-${task.id}`}
              />
            </div>
          );
        },
      }),
    ],
    [deleting, handleRequestDelete, handleRequestEdit, processId, taskUpdating]
  );

  const table = useReactTable({
    data: projectTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

      <div className="project-tasks__title-row">
        <h1 className="h2 mb-0">
          <Translate contentKey="processComposerApp.execution.tasks.title">Project tasks</Translate>
        </h1>
        <Button color="primary" onClick={() => setCreateModalOpen(true)} data-cy="createTaskButton">
          <FontAwesomeIcon icon="plus" className="me-1" />
          <Translate contentKey="processComposerApp.execution.tasks.createButton">New task</Translate>
        </Button>
      </div>

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
        <div className="project-tasks__table-wrapper shadow-sm">
          {projectTasks.length === 0 ? (
            <div className="project-tasks__empty text-muted">
              <Translate contentKey="processComposerApp.execution.tasks.empty">
                No tasks yet. Create the first one for this project.
              </Translate>
            </div>
          ) : (
            <Table responsive hover className="project-tasks__table mb-0">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} scope="col">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} data-cy={`project-task-row-${row.original.id}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={cell.column.id === 'actions' ? 'project-tasks__actions' : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}

      <CreateTaskModal
        isOpen={createModalOpen || editTarget !== null}
        projectId={projectId}
        processId={processId}
        task={editTarget ?? undefined}
        onClose={handleCloseTaskModal}
        onSaved={() => dispatch(getTasks({ eagerload: true }))}
      />

      <Modal isOpen={deleteTarget !== null} toggle={handleCancelDelete}>
        <ModalHeader toggle={handleCancelDelete} data-cy="project-task-delete-dialog-heading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.execution.tasks.delete.confirm" interpolate={{ name: deleteTarget?.name ?? '' }}>
            {`Are you sure you want to delete the task "${deleteTarget?.name ?? ''}"?`}
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelDelete} disabled={deleting}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={deleting} data-cy="project-task-confirm-delete-button">
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectTasks;
