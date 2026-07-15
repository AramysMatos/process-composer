import './process-list.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardText, CardTitle, Col, Input, InputGroup, InputGroupText, Row, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JhiItemCount, JhiPagination, Translate, getSortState, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { countActivitiesForProcess, countPhasesForProcess } from 'app/shared/util/process-stats.utils';
import { SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

const LIST_PAGE_SIZE = 12;
const SEARCH_FETCH_SIZE = 1000;

export const ProcessList = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(location, LIST_PAGE_SIZE, 'id'), location.search)
  );

  const processes = useAppSelector(state => state.process.entities);
  const phases = useAppSelector(state => state.phase.entities);
  const activities = useAppSelector(state => state.activity.entities);
  const loading = useAppSelector(state => state.process.loading);
  const totalItemsFromStore = useAppSelector(state => state.process.totalItems);

  const trimmedSearch = searchQuery.trim();
  const isSearching = trimmedSearch.length > 0;

  const fetchProcesses = () => {
    if (isSearching) {
      dispatch(
        getProcesses({
          page: 0,
          size: SEARCH_FETCH_SIZE,
          sort: `${pagination.sort},${pagination.order}`,
        })
      );
      return;
    }

    dispatch(
      getProcesses({
        page: pagination.activePage - 1,
        size: pagination.itemsPerPage,
        sort: `${pagination.sort},${pagination.order}`,
      })
    );

    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    dispatch(getPhases({}));
    dispatch(getActivities({}));
  }, [dispatch]);

  useEffect(() => {
    fetchProcesses();
  }, [pagination.activePage, pagination.order, pagination.sort, isSearching]);

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

  const filteredProcesses = useMemo(() => {
    if (!isSearching) {
      return processes;
    }
    const normalizedQuery = trimmedSearch.toLowerCase();
    return processes.filter(process => process.processName?.toLowerCase().includes(normalizedQuery));
  }, [isSearching, processes, trimmedSearch]);

  const displayedProcesses = useMemo(() => {
    if (!isSearching) {
      return filteredProcesses;
    }
    const start = (pagination.activePage - 1) * pagination.itemsPerPage;
    return filteredProcesses.slice(start, start + pagination.itemsPerPage);
  }, [filteredProcesses, isSearching, pagination.activePage, pagination.itemsPerPage]);

  const totalItems = isSearching ? filteredProcesses.length : totalItemsFromStore ?? 0;

  const handlePagination = currentPage =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

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

      <InputGroup className="process-list__search mb-4">
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
          {displayedProcesses.map(process => (
            <Col key={process.id} xs={12} md={6} xl={4}>
              <Card
                tag={Link}
                to={`/processos/${process.id}`}
                className="process-list__card shadow-sm text-decoration-none"
                data-cy={`processListCard-${process.id}`}
              >
                <CardBody>
                  <CardTitle tag="h2" className="h5 text-body mb-2">
                    {process.processName}
                  </CardTitle>
                  {process.processDescription && (
                    <CardText className="text-muted small process-list__description">{process.processDescription}</CardText>
                  )}
                  <CardText className="text-muted small mb-0">
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
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          ))}
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
    </div>
  );
};

export default ProcessList;
