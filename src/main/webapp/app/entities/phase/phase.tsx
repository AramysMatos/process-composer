import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IPhase } from 'app/shared/model/phase.model';
import { getEntities } from './phase.reducer';

export const Phase = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const phaseList = useAppSelector(state => state.phase.entities);
  const loading = useAppSelector(state => state.phase.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="phase-heading" data-cy="PhaseHeading">
        <Translate contentKey="processComposerApp.phase.home.title">Phases</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.phase.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/phase/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.phase.home.createLabel">Create new Phase</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {phaseList && phaseList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.phase.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.phase.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.phase.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.phase.process">Process</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {phaseList.map((phase, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/phase/${phase.id}`} color="link" size="sm">
                      {phase.id}
                    </Button>
                  </td>
                  <td>{phase.name}</td>
                  <td>{phase.description}</td>
                  <td>{phase.process ? <Link to={`/process/${phase.process.id}`}>{phase.process.processName}</Link> : ''}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/phase/${phase.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/phase/${phase.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/phase/${phase.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.delete">Delete</Translate>
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              <Translate contentKey="processComposerApp.phase.home.notFound">No Phases found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Phase;
