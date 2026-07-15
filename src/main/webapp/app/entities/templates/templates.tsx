import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { ITemplates } from 'app/shared/model/templates.model';
import { getEntities } from './templates.reducer';

export const Templates = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const templatesList = useAppSelector(state => state.templates.entities);
  const loading = useAppSelector(state => state.templates.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="templates-heading" data-cy="TemplatesHeading">
        <Translate contentKey="processComposerApp.templates.home.title">Templates</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.templates.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/templates/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.templates.home.createLabel">Create new Templates</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {templatesList && templatesList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.templates.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.templates.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.templates.description">Description</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {templatesList.map((templates, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/templates/${templates.id}`} color="link" size="sm">
                      {templates.id}
                    </Button>
                  </td>
                  <td>{templates.name}</td>
                  <td>{templates.description}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/templates/${templates.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/templates/${templates.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/templates/${templates.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="processComposerApp.templates.home.notFound">No Templates found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Templates;
