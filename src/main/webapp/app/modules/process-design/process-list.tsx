import './process-list.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, InputGroup, InputGroupText, Label, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, getSortState, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getUsersAsAdmin } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { deleteEntity as deleteProcess, getEntities as getProcesses, IProcessQueryParams } from 'app/entities/process/process.reducer';
import { duplicateProcess } from 'app/modules/process-design/duplicate-process';
import { ProcessListProcessGrid } from 'app/modules/process-design/process-list-process-grid';
import { applySectionProcessing, ProcessSortOption } from 'app/modules/process-design/process-list-section-processing';
import { useProcessListSections } from 'app/modules/process-design/use-process-list-sections';
import { AUTHORITIES } from 'app/config/constants';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { countPhasesForProcess } from 'app/shared/util/process-stats.utils';
import { SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IProcess } from 'app/shared/model/process.model';
import { downloadStaticSiteForProcessId } from 'app/modules/process-visualization/download-static-site-for-process';
import { YAML_VISUALIZATION_BASE_PATH } from 'app/modules/process-visualization/process-visualization-paths';

const LIST_PAGE_SIZE = 12;
const SEARCH_FETCH_SIZE = 1000;

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

const parseOthersPageFromSearch = (search: string): number => {
  const othersPage = new URLSearchParams(search).get('othersPage');
  if (!othersPage) {
    return 1;
  }
  const parsed = +othersPage;
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
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

const buildListSearch = (
  activePage: number,
  othersPage: number,
  sort: string,
  order: string,
  ownerFilter: OwnerFilterValue,
  includeOthersPage: boolean
): string => {
  const params = new URLSearchParams();
  params.set('page', String(activePage));
  params.set(SORT, `${sort},${order}`);
  if (ownerFilter === 'system') {
    params.set('systemOnly', 'true');
  } else if (ownerFilter !== 'all') {
    params.set('ownerId', ownerFilter);
  }
  if (includeOthersPage && othersPage > 1) {
    params.set('othersPage', String(othersPage));
  }
  return `?${params.toString()}`;
};

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

type ProcessListSectionBlockProps = {
  titleKey: string;
  defaultTitle: string;
  emptyKey: string;
  defaultEmpty: string;
  dataCy: string;
  processes: IProcess[];
  totalItems: number;
  activePage?: number;
  itemsPerPage?: number;
  onSelectPage?: (page: number) => void;
  gridProps: Omit<React.ComponentProps<typeof ProcessListProcessGrid>, 'processes'>;
};

const ProcessListSectionBlock = ({
  titleKey,
  defaultTitle,
  emptyKey,
  defaultEmpty,
  dataCy,
  processes,
  totalItems,
  activePage,
  itemsPerPage,
  onSelectPage,
  gridProps,
}: ProcessListSectionBlockProps) => (
  <section className="process-list__section" data-cy={dataCy}>
    <h2 className="process-list__section-title h4">
      <Translate contentKey={titleKey}>{defaultTitle}</Translate>
    </h2>
    {processes.length === 0 ? (
      <p className="text-muted mb-0">
        <Translate contentKey={emptyKey}>{defaultEmpty}</Translate>
      </p>
    ) : (
      <ProcessListProcessGrid {...gridProps} processes={processes} />
    )}
    {onSelectPage && activePage && itemsPerPage && totalItems > 0 && totalItems > itemsPerPage && (
      <div className="process-list__pagination d-flex flex-wrap justify-content-between align-items-center mt-3 gap-3">
        <JhiItemCount page={activePage} total={totalItems} itemsPerPage={itemsPerPage} i18nEnabled />
        <JhiPagination activePage={activePage} onSelect={onSelectPage} maxButtons={5} itemsPerPage={itemsPerPage} totalItems={totalItems} />
      </div>
    )}
  </section>
);

export const ProcessList = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilterValue>(() => parseOwnerFilterFromSearch(location.search));
  const [othersPage, setOthersPage] = useState(() => parseOthersPageFromSearch(location.search));
  const [deleteTarget, setDeleteTarget] = useState<ProcessDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingProcessId, setDuplicatingProcessId] = useState<number | null>(null);
  const [downloadingStaticSiteId, setDownloadingStaticSiteId] = useState<number | null>(null);
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
  const splitView = !isAdmin || ownerFilter === 'all';
  const includeOthersSection = splitView && isAdmin;
  const ownerFilterParams = useMemo(
    () => (isAdmin && !splitView ? toOwnerFilterParams(ownerFilter) : {}),
    [isAdmin, ownerFilter, splitView]
  );

  const trimmedSearch = searchQuery.trim();
  const isSearching = trimmedSearch.length > 0;
  const sortOption = toSortOption(pagination.sort, pagination.order);
  const needsClientSideCollection = isSearching || sortOption === 'phases';
  const serverSort = sortOption === 'phases' ? 'id,desc' : `${pagination.sort},${pagination.order}`;

  const sections = useProcessListSections({
    enabled: splitView,
    currentUserId: account.id,
    includeOthersSection,
    myPage: pagination.activePage,
    othersPage,
    pageSize: LIST_PAGE_SIZE,
    serverSort,
    myNeedsLargeFetch: needsClientSideCollection,
    othersNeedsLargeFetch: needsClientSideCollection,
    largeFetchSize: SEARCH_FETCH_SIZE,
  });

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
    const nextOthersPage = parseOthersPageFromSearch(location.search);
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
    setOthersPage(current => (current === nextOthersPage ? current : nextOthersPage));
  }, [location.search]);

  useEffect(() => {
    setPagination(current => ({ ...current, activePage: 1 }));
    setOthersPage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    if (splitView) {
      return;
    }

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
    serverSort,
    splitView,
  ]);

  useEffect(() => {
    if (isSearching) {
      return;
    }

    const endURL = buildListSearch(pagination.activePage, othersPage, pagination.sort, pagination.order, ownerFilter, includeOthersSection);
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`, { replace: true });
    }
  }, [
    includeOthersSection,
    isSearching,
    location.pathname,
    location.search,
    navigate,
    othersPage,
    ownerFilter,
    pagination.activePage,
    pagination.order,
    pagination.sort,
  ]);

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

  const mySection = useMemo(() => {
    const processed = applySectionProcessing(
      sections.my.items,
      trimmedSearch,
      sortOption,
      phases,
      needsClientSideCollection,
      pagination.activePage,
      LIST_PAGE_SIZE
    );
    return {
      displayed: processed.displayed,
      totalItems: needsClientSideCollection ? processed.totalItems : sections.my.totalItems,
    };
  }, [needsClientSideCollection, pagination.activePage, phases, sections.my.items, sections.my.totalItems, sortOption, trimmedSearch]);

  const modelsSection = useMemo(
    () => applySectionProcessing(sections.models.items, trimmedSearch, sortOption, phases, false, 1, LIST_PAGE_SIZE).displayed,
    [phases, sections.models.items, sortOption, trimmedSearch]
  );

  const othersSection = useMemo(() => {
    const processed = applySectionProcessing(
      sections.others.items,
      trimmedSearch,
      sortOption,
      phases,
      needsClientSideCollection,
      othersPage,
      LIST_PAGE_SIZE
    );
    return {
      displayed: processed.displayed,
      totalItems: needsClientSideCollection ? processed.totalItems : sections.others.totalItems,
    };
  }, [needsClientSideCollection, othersPage, phases, sections.others.items, sections.others.totalItems, sortOption, trimmedSearch]);

  const listLoading = splitView ? sections.loading : loading;

  const handlePagination = (currentPage: number) =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const handleOthersPagination = (currentPage: number) => setOthersPage(currentPage);

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextSort = toPaginationSort(event.target.value as ProcessSortOption);
    setPagination(current => ({
      ...current,
      ...nextSort,
      activePage: 1,
    }));
    setOthersPage(1);
  };

  const handleOwnerFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerFilter(event.target.value as OwnerFilterValue);
    setPagination(current => ({
      ...current,
      activePage: 1,
    }));
    setOthersPage(1);
  };

  const refreshSections = sections.refresh;

  const refreshProcesses = useCallback(() => {
    if (splitView) {
      refreshSections();
      return;
    }

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
    refreshSections,
    serverSort,
    splitView,
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

  const handleDownloadStaticSite = async (process: IProcess) => {
    if (!process.id || downloadingStaticSiteId !== null) {
      return;
    }

    setDownloadingStaticSiteId(process.id);
    try {
      await downloadStaticSiteForProcessId(process.id);
    } catch {
      // Error notification may be handled by axios interceptor.
    } finally {
      setDownloadingStaticSiteId(null);
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

  const gridHandlers = {
    phases,
    activities,
    isAdmin,
    onDuplicate: handleDuplicate,
    onDownloadStaticSite: handleDownloadStaticSite,
    onRequestDelete: handleRequestDelete,
    duplicatingProcessId,
    downloadingStaticSiteId,
    deleting,
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
        <div className="process-list__header-actions d-flex flex-wrap gap-2">
          <Button tag={Link} to={`${YAML_VISUALIZATION_BASE_PATH}/upload`} color="secondary" outline data-cy="openYamlVisualizationUpload">
            <FontAwesomeIcon icon="eye" className="me-1" />
            <Translate contentKey="processComposerApp.processDesign.list.openYamlVisualization">View from YAML</Translate>
          </Button>
          <Button tag={Link} to="/processos/novo" color="primary" data-cy="createProcessButton">
            <FontAwesomeIcon icon="plus" />{' '}
            <Translate contentKey="processComposerApp.processDesign.list.createLabel">New Process</Translate>
          </Button>
        </div>
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

      {listLoading && (
        <div className="process-list__loading text-center py-5">
          <Spinner color="primary" />
        </div>
      )}

      {!listLoading && splitView && (
        <div className="process-list__sections">
          <ProcessListSectionBlock
            titleKey="processComposerApp.processDesign.list.sections.myProcesses"
            defaultTitle="My processes"
            emptyKey="processComposerApp.processDesign.list.sections.emptyMy"
            defaultEmpty="You have not created any processes yet."
            dataCy="processListSectionMy"
            processes={mySection.displayed}
            totalItems={mySection.totalItems}
            activePage={pagination.activePage}
            itemsPerPage={LIST_PAGE_SIZE}
            onSelectPage={handlePagination}
            gridProps={gridHandlers}
          />
          <ProcessListSectionBlock
            titleKey="processComposerApp.processDesign.list.sections.modelMethods"
            defaultTitle="Model methods"
            emptyKey="processComposerApp.processDesign.list.sections.emptyModels"
            defaultEmpty="No model methods available."
            dataCy="processListSectionModels"
            processes={modelsSection}
            totalItems={modelsSection.length}
            gridProps={{ ...gridHandlers, showSystemBadge: false }}
          />
          {includeOthersSection && (
            <ProcessListSectionBlock
              titleKey="processComposerApp.processDesign.list.sections.otherUsers"
              defaultTitle="Other users' processes"
              emptyKey="processComposerApp.processDesign.list.sections.emptyOthers"
              defaultEmpty="No processes from other users."
              dataCy="processListSectionOthers"
              processes={othersSection.displayed}
              totalItems={othersSection.totalItems}
              activePage={othersPage}
              itemsPerPage={LIST_PAGE_SIZE}
              onSelectPage={handleOthersPagination}
              gridProps={gridHandlers}
            />
          )}
        </div>
      )}

      {!listLoading && !splitView && displayedProcesses.length === 0 && (
        <div className="alert alert-warning" data-cy="processListEmpty">
          <Translate contentKey="processComposerApp.processDesign.list.notFound">No processes found</Translate>
        </div>
      )}

      {!listLoading && !splitView && displayedProcesses.length > 0 && (
        <>
          <ProcessListProcessGrid {...gridHandlers} processes={displayedProcesses} />
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
        </>
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
