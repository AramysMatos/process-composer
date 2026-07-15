import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './artifacts.reducer';

export const ArtifactsDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const artifactsEntity = useAppSelector(state => state.artifacts.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="artifactsDetailsHeading">
          <Translate contentKey="processComposerApp.artifacts.detail.title">Artifacts</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{artifactsEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="processComposerApp.artifacts.name">Name</Translate>
            </span>
          </dt>
          <dd>{artifactsEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="processComposerApp.artifacts.description">Description</Translate>
            </span>
          </dt>
          <dd>{artifactsEntity.description}</dd>
          <dt>
            <span id="optional">
              <Translate contentKey="processComposerApp.artifacts.optional">Optional</Translate>
            </span>
          </dt>
          <dd>{artifactsEntity.optional ? 'true' : 'false'}</dd>
          <dt>
            <Translate contentKey="processComposerApp.artifacts.templates">Templates</Translate>
          </dt>
          <dd>
            {artifactsEntity.templates
              ? artifactsEntity.templates.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {artifactsEntity.templates && i === artifactsEntity.templates.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/artifacts" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/artifacts/${artifactsEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default ArtifactsDetail;
