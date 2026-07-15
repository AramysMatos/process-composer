import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './phase.reducer';

export const PhaseDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const phaseEntity = useAppSelector(state => state.phase.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="phaseDetailsHeading">
          <Translate contentKey="processComposerApp.phase.detail.title">Phase</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{phaseEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="processComposerApp.phase.name">Name</Translate>
            </span>
          </dt>
          <dd>{phaseEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="processComposerApp.phase.description">Description</Translate>
            </span>
          </dt>
          <dd>{phaseEntity.description}</dd>
          <dt>
            <Translate contentKey="processComposerApp.phase.process">Process</Translate>
          </dt>
          <dd>{phaseEntity.process ? phaseEntity.process.processName : ''}</dd>
        </dl>
        <Button tag={Link} to="/phase" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/phase/${phaseEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default PhaseDetail;
