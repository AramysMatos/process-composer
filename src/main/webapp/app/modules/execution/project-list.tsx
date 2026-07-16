import './project-list.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, getSortState, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { deleteEntity as deleteProject, getEntities as getProjects } from 'app/entities/project/project.reducer';
import { getEntities as getTasks } from 'app/entities/task/task.reducer';
import { SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { isGitHubConnected } from 'app/modules/execution/execution.utils';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { IProject } from 'app/shared/model/project.model';

const LIST_PAGE_SIZE = 12;

type ProjectDeleteTarget = {
  id: number;
  name: string;
};

export const ProjectList = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProjectDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(location, LIST_PAGE_SIZE, 'id'), location.search)
  );

  const projects = useAppSelector(state => state.project.entities);
  const processes = useAppSelector(state => state.process.entities);
  const tasks = useAppSelector(state => state.task.entities);
  const loading = useAppSelector(state => state.project.loading);

  const trimmedSearch = searchQuery.trim();
  const hasProcesses = processes.length > 0;

  useEffect(() => {
    dispatch(getProjects({}));
    dispatch(getProcesses({ page: 0, size: 1000, sort: 'id,desc' }));
    dispatch(getTasks({}));
  }, [dispatch]);

  useEffect(() => {
    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`);
    }
  }, [location.pathname, location.search, navigate, pagination.activePage, pagination.order, pagination.sort]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const sortParam = params.get(SORT);
    if (page && sortParam) {
      const sortSplit = sortParam.split(',');
      setPagination(current => ({
        ...current,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      }));
    }
  }, [location.search]);

  useEffect(() => {
    setPagination(current => ({ ...current, activePage: 1 }));
  }, [trimmedSearch]);

  const sortedProjects = useMemo(() => {
    const direction = pagination.order === 'asc' ? 1 : -1;
    return [...projects].sort((left, right) => {
      if (pagination.sort === 'name') {
        return direction * (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
      }
      return direction * ((left.id ?? 0) - (right.id ?? 0));
    });
  }, [pagination.order, pagination.sort, projects]);

  const filteredProjects = useMemo(() => {
    if (!trimmedSearch) {
      return sortedProjects;
    }
    const normalizedQuery = trimmedSearch.toLowerCase();
    return sortedProjects.filter(project => {
      const name = project.name?.toLowerCase() ?? '';
      const description = project.description?.toLowerCase() ?? '';
      const processName = project.process?.processName?.toLowerCase() ?? '';
      return name.includes(normalizedQuery) || description.includes(normalizedQuery) || processName.includes(normalizedQuery);
    });
  }, [sortedProjects, trimmedSearch]);

  const displayedProjects = useMemo(() => {
    const start = (pagination.activePage - 1) * pagination.itemsPerPage;
    return filteredProjects.slice(start, start + pagination.itemsPerPage);
  }, [filteredProjects, pagination.activePage, pagination.itemsPerPage]);

  const totalItems = filteredProjects.length;

  const countTasksForProject = (projectId?: number) => (projectId ? tasks.filter(task => task.project?.id === projectId).length : 0);

  const handlePagination = (currentPage: number) =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const handleRequestDelete = (project: IProject) => {
    if (!project.id) {
      return;
    }

    setDeleteTarget({ id: project.id, name: project.name ?? '' });
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteProject(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      dispatch(getProjects({}));
    } catch {
      // Modal stays open so the user can retry or cancel.
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch]);

  return (
    <div className="project-list" data-cy="projectList">
      <div className="project-list__header">
        <div>
          <h1 className="h2 mb-1">
            <Translate contentKey="processComposerApp.execution.list.title">Projects</Translate>
          </h1>
          <p className="text-muted mb-0">
            <Translate contentKey="processComposerApp.execution.list.subtitle">Browse and manage all running projects</Translate>
          </p>
        </div>
        {hasProcesses && (
          <Button tag={Link} to="/projetos/novo" color="primary" data-cy="createProjectButton">
            <FontAwesomeIcon icon="plus" /> <Translate contentKey="processComposerApp.execution.list.createLabel">New Project</Translate>
          </Button>
        )}
      </div>

      <InputGroup className="project-list__search mb-4">
        <InputGroupText>
          <FontAwesomeIcon icon="search" />
        </InputGroupText>
        <Input
          type="search"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder={translate('processComposerApp.execution.list.searchPlaceholder', 'Search by name...')}
          aria-label={translate('processComposerApp.execution.list.searchPlaceholder', 'Search by name...')}
          data-cy="projectSearchInput"
        />
      </InputGroup>

      {loading && (
        <div className="project-list__loading text-center py-5">
          <Spinner color="primary" />
        </div>
      )}

      {!loading && !hasProcesses && (
        <div className="alert alert-info" data-cy="projectListRequiresProcess">
          <Translate contentKey="home.dashboard.project.requiresProcess">
            Projects are created from an existing process. Create at least one process before instantiating a project.
          </Translate>
        </div>
      )}

      {!loading && hasProcesses && displayedProjects.length === 0 && (
        <div className="alert alert-warning" data-cy="projectListEmpty">
          <Translate contentKey="processComposerApp.execution.list.notFound">No projects found</Translate>
        </div>
      )}

      {!loading && hasProcesses && displayedProjects.length > 0 && (
        <Row className="g-3 project-list__grid">
          {displayedProjects.map(project => (
            <Col key={project.id} xs={12} md={6} xl={4}>
              <Card className="project-list__card shadow-sm" data-cy={`projectListCard-${project.id}`}>
                <CardBody className="project-list__card-body">
                  <div className="project-list__card-header">
                    <CardTitle tag="h2" className="h5 text-body mb-0">
                      {project.name}
                    </CardTitle>
                    <CardActionsMenu
                      data-cy={`projectListCardMenu-${project.id}`}
                      items={[
                        {
                          key: 'delete',
                          label: (
                            <>
                              <FontAwesomeIcon icon="trash" className="me-2" />
                              <Translate contentKey="processComposerApp.execution.list.actions.deleteProject">Delete project</Translate>
                            </>
                          ),
                          onClick: () => handleRequestDelete(project),
                          danger: true,
                          disabled: deleting,
                          'data-cy': `projectDelete-${project.id}`,
                        },
                      ]}
                    />
                  </div>

                  {project.description && <CardText className="text-muted small project-list__description">{project.description}</CardText>}

                  <CardText className="text-muted small mb-2">
                    <Translate contentKey="home.dashboard.project.sourceProcess">Source process</Translate>:{' '}
                    <span className="fw-semibold">{project.process?.processName ?? '—'}</span>
                  </CardText>

                  <CardText className="text-muted small mb-2">
                    <Translate
                      contentKey="processComposerApp.execution.list.taskCount"
                      interpolate={{ count: countTasksForProject(project.id) }}
                    >
                      {`${countTasksForProject(project.id)} tasks`}
                    </Translate>
                  </CardText>

                  <Badge color={isGitHubConnected(project) ? 'success' : 'secondary'} pill className="project-list__card-badge">
                    {isGitHubConnected(project) ? (
                      <Translate contentKey="home.dashboard.project.githubConnected">GitHub connected</Translate>
                    ) : (
                      <Translate contentKey="home.dashboard.project.githubNotConnected">GitHub not connected</Translate>
                    )}
                  </Badge>

                  <div className="project-list__card-actions d-flex flex-wrap gap-2">
                    <Button tag={Link} to={`/projetos/${project.id}`} color="info" size="sm" data-cy={`projectOpen-${project.id}`}>
                      <FontAwesomeIcon icon="eye" /> <Translate contentKey="home.dashboard.process.open">Open</Translate>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {totalItems > 0 && (
        <div className="project-list__pagination d-flex flex-wrap justify-content-between align-items-center mt-4 gap-3">
          <JhiItemCount page={pagination.activePage} total={totalItems} itemsPerPage={pagination.itemsPerPage} i18nEnabled />
          <JhiPagination
            activePage={pagination.activePage}
            onSelect={handlePagination}
            maxButtons={5}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      <Modal isOpen={deleteTarget !== null} toggle={handleCancelDelete}>
        <ModalHeader toggle={handleCancelDelete} data-cy="projectListDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.execution.list.delete.confirm" interpolate={{ name: deleteTarget?.name ?? '' }}>
            {`Are you sure you want to delete the project "${deleteTarget?.name ?? ''}"?`}
          </Translate>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCancelDelete} disabled={deleting}>
            <FontAwesomeIcon icon="ban" /> <Translate contentKey="entity.action.cancel">Cancel</Translate>
          </Button>
          <Button
            color="danger"
            onClick={() => {
              void handleConfirmDelete();
            }}
            disabled={deleting}
            data-cy="projectListConfirmDeleteButton"
          >
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProjectList;
