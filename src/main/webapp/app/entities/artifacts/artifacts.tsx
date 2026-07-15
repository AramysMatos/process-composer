import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IArtifacts } from 'app/shared/model/artifacts.model';
import { getEntities } from './artifacts.reducer';

export const Artifacts = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const artifactsList = useAppSelector(state => state.artifacts.entities);
  const loading = useAppSelector(state => state.artifacts.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="artifacts-heading" data-cy="ArtifactsHeading">
        <Translate contentKey="processComposerApp.artifacts.home.title">Artifacts</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.artifacts.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/artifacts/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.artifacts.home.createLabel">Create new Artifacts</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {artifactsList && artifactsList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.artifacts.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.artifacts.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.artifacts.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.artifacts.optional">Optional</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.artifacts.templates">Templates</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {artifactsList.map((artifacts, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/artifacts/${artifacts.id}`} color="link" size="sm">
                      {artifacts.id}
                    </Button>
                  </td>
                  <td>{artifacts.name}</td>
                  <td>{artifacts.description}</td>
                  <td>{artifacts.optional ? 'true' : 'false'}</td>
                  <td>
                    {artifacts.templates
                      ? artifacts.templates.map((val, j) => (
                          <span key={j}>
                            <Link to={`/templates/${val.id}`}>{val.name}</Link>
                            {j === artifacts.templates.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/artifacts/${artifacts.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/artifacts/${artifacts.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/artifacts/${artifacts.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="processComposerApp.artifacts.home.notFound">No Artifacts found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Artifacts;
