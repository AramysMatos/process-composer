import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IActivity } from 'app/shared/model/activity.model';
import { getEntities } from './activity.reducer';

export const Activity = () => {
  const dispatch = useAppDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const activityList = useAppSelector(state => state.activity.entities);
  const loading = useAppSelector(state => state.activity.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, []);

  const handleSyncList = () => {
    dispatch(getEntities({}));
  };

  return (
    <div>
      <h2 id="activity-heading" data-cy="ActivityHeading">
        <Translate contentKey="processComposerApp.activity.home.title">Activities</Translate>
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="processComposerApp.activity.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to="/activity/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="processComposerApp.activity.home.createLabel">Create new Activity</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {activityList && activityList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="processComposerApp.activity.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.inputCriterion">Input Criterion</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.subActivities">Sub Activities</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.templates">Templates</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.guidelines">Guidelines</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.participantRoles">Participant Roles</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.responsibleRoles">Responsible Roles</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.tools">Tools</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.requiredArtifacts">Required Artifacts</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.producedArtifacts">Produced Artifacts</Translate>
                </th>
                <th>
                  <Translate contentKey="processComposerApp.activity.phase">Phase</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {activityList.map((activity, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/activity/${activity.id}`} color="link" size="sm">
                      {activity.id}
                    </Button>
                  </td>
                  <td>{activity.name}</td>
                  <td>{activity.description}</td>
                  <td>{activity.inputCriterion}</td>
                  <td>
                    {activity.subActivities
                      ? activity.subActivities.map((val, j) => (
                          <span key={j}>
                            <Link to={`/activity/${val.id}`}>{val.name}</Link>
                            {j === activity.subActivities.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.templates
                      ? activity.templates.map((val, j) => (
                          <span key={j}>
                            <Link to={`/templates/${val.id}`}>{val.name}</Link>
                            {j === activity.templates.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.guidelines
                      ? activity.guidelines.map((val, j) => (
                          <span key={j}>
                            <Link to={`/guidelines/${val.id}`}>{val.name}</Link>
                            {j === activity.guidelines.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.participantRoles
                      ? activity.participantRoles.map((val, j) => (
                          <span key={j}>
                            <Link to={`/roles/${val.id}`}>{val.name}</Link>
                            {j === activity.participantRoles.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.responsibleRoles
                      ? activity.responsibleRoles.map((val, j) => (
                          <span key={j}>
                            <Link to={`/roles/${val.id}`}>{val.name}</Link>
                            {j === activity.responsibleRoles.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.tools
                      ? activity.tools.map((val, j) => (
                          <span key={j}>
                            <Link to={`/tools/${val.id}`}>{val.name}</Link>
                            {j === activity.tools.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.requiredArtifacts
                      ? activity.requiredArtifacts.map((val, j) => (
                          <span key={j}>
                            <Link to={`/artifacts/${val.id}`}>{val.name}</Link>
                            {j === activity.requiredArtifacts.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {activity.producedArtifacts
                      ? activity.producedArtifacts.map((val, j) => (
                          <span key={j}>
                            <Link to={`/artifacts/${val.id}`}>{val.name}</Link>
                            {j === activity.producedArtifacts.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>{activity.phase ? <Link to={`/phase/${activity.phase.id}`}>{activity.phase.name}</Link> : ''}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/activity/${activity.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/activity/${activity.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`/activity/${activity.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="processComposerApp.activity.home.notFound">No Activities found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Activity;
