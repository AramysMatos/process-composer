import './process-list.scss';

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
  Label,
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
import { getUsersAsAdmin } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { deleteEntity as deleteProcess, getEntities as getProcesses, IProcessQueryParams } from 'app/entities/process/process.reducer';
import { duplicateProcess } from 'app/modules/process-design/duplicate-process';
import { AUTHORITIES } from 'app/config/constants';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { countActivitiesForProcess, countPhasesForProcess } from 'app/shared/util/process-stats.utils';
import { SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { IProcess } from 'app/shared/model/process.model';
import { isSystemTemplate } from 'app/shared/model/owned-entity.model';

const LIST_PAGE_SIZE = 12;
const SEARCH_FETCH_SIZE = 1000;

type ProcessSortOption = 'recent' | 'name' | 'phases';
type OwnerFilterValue = 'all' | 'system' | string;

type ProcessDeleteTarget = {
  id: number;
  name: string;
};

const parseOwnerFilterFromSearch = (search: string): OwnerFilterValue => {
  const params = new URLSearchParams(search);
  if (params.get('systemOnly') === 'true') {
    return 'system';
  }
  const ownerId = params.get('ownerId');
  if (ownerId) {
    return ownerId;
  }
  return 'all';
};

const toOwnerFilterParams = (ownerFilter: OwnerFilterValue): Pick<IProcessQueryParams, 'ownerId' | 'systemOnly'> => {
  if (ownerFilter === 'system') {
    return { systemOnly: true };
  }
  if (ownerFilter !== 'all') {
    return { ownerId: Number(ownerFilter) };
  }
  return {};
};

const buildListSearch = (activePage: number, sort: string, order: string, ownerFilter: OwnerFilterValue): string => {
  const params = new URLSearchParams();
  params.set('page', String(activePage));
  params.set(SORT, `${sort},${order}`);
  if (ownerFilter === 'system') {
    params.set('systemOnly', 'true');
  } else if (ownerFilter !== 'all') {
    params.set('ownerId', ownerFilter);
  }
  return `?${params.toString()}`;
};

const getProcessOwnerLogin = (process: IProcess): string | null => process.owner?.login ?? process.createdBy ?? null;

const SORT_OPTIONS: Array<{ value: ProcessSortOption; labelKey: string; defaultLabel: string }> = [
  { value: 'recent', labelKey: 'processComposerApp.processDesign.list.sort.recent', defaultLabel: 'Most recent' },
  { value: 'name', labelKey: 'processComposerApp.processDesign.list.sort.name', defaultLabel: 'Name (A-Z)' },
  { value: 'phases', labelKey: 'processComposerApp.processDesign.list.sort.phases', defaultLabel: 'Most phases' },
];

const toSortOption = (sort: string, order: string): ProcessSortOption => {
  if (sort === 'processName' && order === 'asc') {
    return 'name';
  }
  if (sort === 'phases') {
    return 'phases';
  }
  return 'recent';
};

const toPaginationSort = (option: ProcessSortOption): { sort: string; order: string } => {
  if (option === 'name') {
    return { sort: 'processName', order: 'asc' };
  }
  if (option === 'phases') {
    return { sort: 'phases', order: 'desc' };
  }
  return { sort: 'id', order: 'desc' };
};

export const ProcessList = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilterValue>(() => parseOwnerFilterFromSearch(location.search));
  const [deleteTarget, setDeleteTarget] = useState<ProcessDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingProcessId, setDuplicatingProcessId] = useState<number | null>(null);
  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(location, LIST_PAGE_SIZE, 'id'), location.search)
  );

  const processes = useAppSelector(state => state.process.entities);
  const phases = useAppSelector(state => state.phase.entities);
  const activities = useAppSelector(state => state.activity.entities);
  const loading = useAppSelector(state => state.process.loading);
  const totalItemsFromStore = useAppSelector(state => state.process.totalItems);
  const account = useAppSelector(state => state.authentication.account);
  const users = useAppSelector(state => state.userManagement.users);
  const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);
  const ownerFilterParams = useMemo(() => (isAdmin ? toOwnerFilterParams(ownerFilter) : {}), [isAdmin, ownerFilter]);

  const trimmedSearch = searchQuery.trim();
  const isSearching = trimmedSearch.length > 0;
  const sortOption = toSortOption(pagination.sort, pagination.order);
  const needsClientSideCollection = isSearching || sortOption === 'phases';

  useEffect(() => {
    dispatch(getPhases({}));
    dispatch(getActivities({}));
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(getUsersAsAdmin({ page: 0, size: 1000, sort: 'login,asc' }));
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const sortParam = params.get(SORT);
    if (!page || !sortParam) {
      return;
    }

    const sortSplit = sortParam.split(',');
    const nextOwnerFilter = parseOwnerFilterFromSearch(location.search);
    setPagination(current => {
      if (current.activePage === +page && current.sort === sortSplit[0] && current.order === sortSplit[1]) {
        return current;
      }

      return {
        ...current,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      };
    });
    setOwnerFilter(current => (current === nextOwnerFilter ? current : nextOwnerFilter));
  }, [location.search]);

  useEffect(() => {
    setPagination(current => ({ ...current, activePage: 1 }));
  }, [trimmedSearch]);

  useEffect(() => {
    const serverSort = sortOption === 'phases' ? 'id,desc' : `${pagination.sort},${pagination.order}`;

    if (needsClientSideCollection) {
      dispatch(
        getProcesses({
          page: 0,
          size: SEARCH_FETCH_SIZE,
          sort: serverSort,
          ...ownerFilterParams,
        })
      );
      return;
    }

    dispatch(
      getProcesses({
        page: pagination.activePage - 1,
        size: pagination.itemsPerPage,
        sort: serverSort,
        ...ownerFilterParams,
      })
    );
  }, [
    dispatch,
    needsClientSideCollection,
    ownerFilterParams,
    pagination.activePage,
    pagination.itemsPerPage,
    pagination.order,
    pagination.sort,
    sortOption,
    trimmedSearch,
  ]);

  useEffect(() => {
    if (isSearching) {
      return;
    }

    const endURL = buildListSearch(pagination.activePage, pagination.sort, pagination.order, ownerFilter);
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`, { replace: true });
    }
  }, [isSearching, location.pathname, location.search, navigate, ownerFilter, pagination.activePage, pagination.order, pagination.sort]);

  const filteredProcesses = useMemo(() => {
    let result = processes;

    if (isSearching) {
      const normalizedQuery = trimmedSearch.toLowerCase();
      result = processes.filter(process => process.processName?.toLowerCase().includes(normalizedQuery));
    }

    if (sortOption === 'phases') {
      return [...result].sort((left, right) => countPhasesForProcess(right.id, phases) - countPhasesForProcess(left.id, phases));
    }

    return result;
  }, [isSearching, phases, processes, sortOption, trimmedSearch]);

  const displayedProcesses = useMemo(() => {
    if (needsClientSideCollection) {
      const start = (pagination.activePage - 1) * pagination.itemsPerPage;
      return filteredProcesses.slice(start, start + pagination.itemsPerPage);
    }

    return filteredProcesses;
  }, [filteredProcesses, needsClientSideCollection, pagination.activePage, pagination.itemsPerPage]);

  const totalItems = needsClientSideCollection ? filteredProcesses.length : totalItemsFromStore ?? 0;

  const handlePagination = (currentPage: number) =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSort = toPaginationSort(event.target.value as ProcessSortOption);
    setPagination(current => ({
      ...current,
      ...nextSort,
      activePage: 1,
    }));
  };

  const handleOwnerFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerFilter(event.target.value as OwnerFilterValue);
    setPagination(current => ({
      ...current,
      activePage: 1,
    }));
  };

  const refreshProcesses = useCallback(() => {
    const serverSort = sortOption === 'phases' ? 'id,desc' : `${pagination.sort},${pagination.order}`;

    if (needsClientSideCollection) {
      dispatch(
        getProcesses({
          page: 0,
          size: SEARCH_FETCH_SIZE,
          sort: serverSort,
          ...ownerFilterParams,
        })
      );
      return;
    }

    dispatch(
      getProcesses({
        page: pagination.activePage - 1,
        size: pagination.itemsPerPage,
        sort: serverSort,
        ...ownerFilterParams,
      })
    );
  }, [
    dispatch,
    needsClientSideCollection,
    ownerFilterParams,
    pagination.activePage,
    pagination.itemsPerPage,
    pagination.order,
    pagination.sort,
    sortOption,
  ]);

  const handleRequestDelete = (process: IProcess) => {
    if (!process.id) {
      return;
    }

    setDeleteTarget({ id: process.id, name: process.processName ?? '' });
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteProcess(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      refreshProcesses();
    } catch {
      // Modal stays open so the user can retry or cancel.
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (process: IProcess) => {
    if (!process.id || duplicatingProcessId !== null) {
      return;
    }

    setDuplicatingProcessId(process.id);
    try {
      await duplicateProcess(dispatch, process.id);
      refreshProcesses();
    } catch {
      // Error notification is handled by middleware.
    } finally {
      setDuplicatingProcessId(null);
    }
  };

  return (
    <div className="process-list" data-cy="processList">
      <div className="process-list__header">
        <div>
          <h1 className="h2 mb-1">
            <Translate contentKey="processComposerApp.processDesign.list.title">Processes</Translate>
          </h1>
          <p className="text-muted mb-0">
            <Translate contentKey="processComposerApp.processDesign.list.subtitle">Browse and manage all process definitions</Translate>
          </p>
        </div>
        <Button tag={Link} to="/processos/novo" color="primary" data-cy="createProcessButton">
          <FontAwesomeIcon icon="plus" /> <Translate contentKey="processComposerApp.processDesign.list.createLabel">New Process</Translate>
        </Button>
      </div>

      <div className="process-list__toolbar mb-4">
        <InputGroup className="process-list__search">
          <InputGroupText>
            <FontAwesomeIcon icon="search" />
          </InputGroupText>
          <Input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder={translate('processComposerApp.processDesign.list.searchPlaceholder', 'Search by name...')}
            aria-label={translate('processComposerApp.processDesign.list.searchPlaceholder', 'Search by name...')}
            data-cy="processSearchInput"
          />
        </InputGroup>

        <div className="process-list__sort">
          <Label for="processSortSelect" className="process-list__sort-label visually-hidden">
            <Translate contentKey="processComposerApp.processDesign.list.sort.label">Sort by</Translate>
          </Label>
          <Input id="processSortSelect" type="select" value={sortOption} onChange={handleSortChange} data-cy="processSortSelect">
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {translate(option.labelKey, option.defaultLabel)}
              </option>
            ))}
          </Input>
        </div>

        {isAdmin && (
          <div className="process-list__owner-filter">
            <Label for="processOwnerFilterSelect" className="process-list__sort-label visually-hidden">
              <Translate contentKey="processComposerApp.processDesign.list.ownerFilter.label">Owner</Translate>
            </Label>
            <Input
              id="processOwnerFilterSelect"
              type="select"
              value={ownerFilter}
              onChange={handleOwnerFilterChange}
              data-cy="processOwnerFilterSelect"
            >
              <option value="all">{translate('processComposerApp.processDesign.list.ownerFilter.all', 'All')}</option>
              <option value="system">{translate('processComposerApp.processDesign.list.ownerFilter.system', 'System template')}</option>
              {users.map(user => (
                <option key={user.id} value={String(user.id)}>
                  {user.login}
                </option>
              ))}
            </Input>
          </div>
        )}
      </div>

      {loading && (
        <div className="process-list__loading text-center py-5">
          <Spinner color="primary" />
        </div>
      )}

      {!loading && displayedProcesses.length === 0 && (
        <div className="alert alert-warning" data-cy="processListEmpty">
          <Translate contentKey="processComposerApp.processDesign.list.notFound">No processes found</Translate>
        </div>
      )}

      {!loading && displayedProcesses.length > 0 && (
        <Row className="g-3 process-list__grid">
          {displayedProcesses.map(process => {
            const isDuplicating = duplicatingProcessId === process.id;
            const ownerLogin = getProcessOwnerLogin(process);
            const showSystemBadge = isSystemTemplate(process);
            const showOwnerLabel = isAdmin && !showSystemBadge && ownerLogin;

            return (
              <Col key={process.id} xs={12} md={6} xl={4}>
                <Card className="process-list__card shadow-sm" data-cy={`processListCard-${process.id}`}>
                  <CardBody className="process-list__card-body">
                    <div className="process-list__card-header">
                      <CardTitle tag="h2" className="h5 text-body mb-0">
                        {process.processName}
                      </CardTitle>
                      <CardActionsMenu
                        data-cy={`processListCardMenu-${process.id}`}
                        items={[
                          {
                            key: 'duplicate',
                            label: (
                              <>
                                <FontAwesomeIcon icon="copy" className="me-2" />
                                <Translate contentKey="processComposerApp.processDesign.list.actions.duplicate">
                                  Duplicate process
                                </Translate>
                              </>
                            ),
                            onClick() {
                              void handleDuplicate(process);
                            },
                            disabled: isDuplicating || duplicatingProcessId !== null,
                            'data-cy': `processDuplicate-${process.id}`,
                          },
                          {
                            key: 'export',
                            label: (
                              <>
                                <FontAwesomeIcon icon="file-code" className="me-2" />
                                <Translate contentKey="processComposerApp.processDesign.list.actions.exportYaml">Export YAML</Translate>
                              </>
                            ),
                            to: `/processos/${process.id}/exportar`,
                            'data-cy': `processExportYaml-${process.id}`,
                          },
                          {
                            key: 'delete',
                            label: (
                              <>
                                <FontAwesomeIcon icon="trash" className="me-2" />
                                <Translate contentKey="entity.action.delete">Delete</Translate>
                              </>
                            ),
                            onClick: () => handleRequestDelete(process),
                            danger: true,
                            disabled: deleting,
                            'data-cy': `processDelete-${process.id}`,
                          },
                        ]}
                      />
                    </div>

                    {process.processDescription && (
                      <CardText className="text-muted small process-list__description">{process.processDescription}</CardText>
                    )}

                    {showOwnerLabel && (
                      <CardText className="small mb-2">
                        <span className="text-muted">
                          <Translate contentKey="processComposerApp.processDesign.list.owner.label" interpolate={{ login: ownerLogin }}>
                            {`Owner: ${ownerLogin}`}
                          </Translate>
                        </span>
                      </CardText>
                    )}

                    <CardText className="text-muted small mb-0 d-flex flex-wrap align-items-center gap-2">
                      <span>
                        <Translate
                          contentKey="home.dashboard.process.phaseCount"
                          interpolate={{ count: countPhasesForProcess(process.id, phases) }}
                        >
                          {`${countPhasesForProcess(process.id, phases)} phases`}
                        </Translate>
                        {' · '}
                        <Translate
                          contentKey="home.dashboard.process.activityCount"
                          interpolate={{ count: countActivitiesForProcess(process.id, phases, activities) }}
                        >
                          {`${countActivitiesForProcess(process.id, phases, activities)} activities`}
                        </Translate>
                      </span>
                      {showSystemBadge && (
                        <Badge color="info" className="mb-0">
                          <Translate contentKey="processComposerApp.library.systemTemplate">Modelo</Translate>
                        </Badge>
                      )}
                    </CardText>

                    <div className="process-list__card-actions d-flex flex-wrap gap-2">
                      <Button tag={Link} to={`/processos/${process.id}`} color="info" size="sm" data-cy={`processOpen-${process.id}`}>
                        <FontAwesomeIcon icon="eye" /> <Translate contentKey="home.dashboard.process.open">Open</Translate>
                      </Button>
                      <Button
                        tag={Link}
                        to={`/projetos/novo?processId=${process.id}`}
                        color="primary"
                        size="sm"
                        data-cy={`processInstantiate-${process.id}`}
                      >
                        <FontAwesomeIcon icon="plus" />{' '}
                        <Translate contentKey="home.dashboard.process.instantiateProject">Instantiate Project</Translate>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {totalItems > 0 && (
        <div className="process-list__pagination d-flex flex-wrap justify-content-between align-items-center mt-4 gap-3">
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
        <ModalHeader toggle={handleCancelDelete} data-cy="processListDeleteDialogHeading">
          <Translate contentKey="entity.delete.title">Confirm delete operation</Translate>
        </ModalHeader>
        <ModalBody>
          <Translate contentKey="processComposerApp.processDesign.list.delete.confirm" interpolate={{ name: deleteTarget?.name ?? '' }}>
            {`Are you sure you want to delete the process "${deleteTarget?.name ?? ''}"?`}
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
            data-cy="processListConfirmDeleteButton"
          >
            <FontAwesomeIcon icon="trash" /> <Translate contentKey="entity.action.delete">Delete</Translate>
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProcessList;
