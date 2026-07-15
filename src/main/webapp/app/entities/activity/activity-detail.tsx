import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './activity.reducer';

export const ActivityDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const activityEntity = useAppSelector(state => state.activity.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="activityDetailsHeading">
          <Translate contentKey="processComposerApp.activity.detail.title">Activity</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{activityEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="processComposerApp.activity.name">Name</Translate>
            </span>
          </dt>
          <dd>{activityEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="processComposerApp.activity.description">Description</Translate>
            </span>
          </dt>
          <dd>{activityEntity.description}</dd>
          <dt>
            <span id="inputCriterion">
              <Translate contentKey="processComposerApp.activity.inputCriterion">Input Criterion</Translate>
            </span>
          </dt>
          <dd>{activityEntity.inputCriterion}</dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.subActivities">Sub Activities</Translate>
          </dt>
          <dd>
            {activityEntity.subActivities
              ? activityEntity.subActivities.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.subActivities && i === activityEntity.subActivities.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.templates">Templates</Translate>
          </dt>
          <dd>
            {activityEntity.templates
              ? activityEntity.templates.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.templates && i === activityEntity.templates.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.guidelines">Guidelines</Translate>
          </dt>
          <dd>
            {activityEntity.guidelines
              ? activityEntity.guidelines.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.guidelines && i === activityEntity.guidelines.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.participantRoles">Participant Roles</Translate>
          </dt>
          <dd>
            {activityEntity.participantRoles
              ? activityEntity.participantRoles.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.participantRoles && i === activityEntity.participantRoles.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.responsibleRoles">Responsible Roles</Translate>
          </dt>
          <dd>
            {activityEntity.responsibleRoles
              ? activityEntity.responsibleRoles.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.responsibleRoles && i === activityEntity.responsibleRoles.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.tools">Tools</Translate>
          </dt>
          <dd>
            {activityEntity.tools
              ? activityEntity.tools.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.tools && i === activityEntity.tools.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.requiredArtifacts">Required Artifacts</Translate>
          </dt>
          <dd>
            {activityEntity.requiredArtifacts
              ? activityEntity.requiredArtifacts.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.requiredArtifacts && i === activityEntity.requiredArtifacts.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.producedArtifacts">Produced Artifacts</Translate>
          </dt>
          <dd>
            {activityEntity.producedArtifacts
              ? activityEntity.producedArtifacts.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {activityEntity.producedArtifacts && i === activityEntity.producedArtifacts.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="processComposerApp.activity.phase">Phase</Translate>
          </dt>
          <dd>{activityEntity.phase ? activityEntity.phase.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/activity" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/activity/${activityEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default ActivityDetail;
