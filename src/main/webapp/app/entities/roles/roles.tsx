import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IRoles } from 'app/shared/model/roles.model';
import { getEntities } from './roles.reducer';

export const Roles = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const rolesList = useAppSelector(state => state.roles.entities);
  const loading = useAppSelector(state => state.roles.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="roles-heading" data-cy="RolesHeading">
        <Translate contentKey="processComposerApp.roles.home.title">Roles</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.roles.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/roles/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.roles.home.createLabel">Create new Roles</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {rolesList && rolesList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.roles.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.roles.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.roles.description">Description</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rolesList.map((roles, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/roles/${roles.id}`} color="link" size="sm">
                      {roles.id}
                    </Button>
                  </td>
                  <td>{roles.name}</td>
                  <td>{roles.description}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/roles/${roles.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/roles/${roles.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/roles/${roles.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="processComposerApp.roles.home.notFound">No Roles found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Roles;
