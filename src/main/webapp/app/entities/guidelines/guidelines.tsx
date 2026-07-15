import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IGuidelines } from 'app/shared/model/guidelines.model';
import { getEntities } from './guidelines.reducer';

export const Guidelines = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const guidelinesList = useAppSelector(state => state.guidelines.entities);
  const loading = useAppSelector(state => state.guidelines.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="guidelines-heading" data-cy="GuidelinesHeading">
        <Translate contentKey="processComposerApp.guidelines.home.title">Guidelines</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.guidelines.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/guidelines/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.guidelines.home.createLabel">Create new Guidelines</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {guidelinesList && guidelinesList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.guidelines.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.guidelines.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.guidelines.description">Description</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {guidelinesList.map((guidelines, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/guidelines/${guidelines.id}`} color="link" size="sm">
                      {guidelines.id}
                    </Button>
                  </td>
                  <td>{guidelines.name}</td>
                  <td>{guidelines.description}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/guidelines/${guidelines.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/guidelines/${guidelines.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/guidelines/${guidelines.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="processComposerApp.guidelines.home.notFound">No Guidelines found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Guidelines;
