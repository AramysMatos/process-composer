import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './process.reducer';

export const ProcessDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const processEntity = useAppSelector(state => state.process.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="processDetailsHeading">
          <Translate contentKey="processComposerApp.process.detail.title">Process</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{processEntity.id}</dd>
          <dt>
            <span id="processName">
              <Translate contentKey="processComposerApp.process.processName">Process Name</Translate>
            </span>
          </dt>
          <dd>{processEntity.processName}</dd>
          <dt>
            <span id="processDescription">
              <Translate contentKey="processComposerApp.process.processDescription">Process Description</Translate>
            </span>
          </dt>
          <dd>{processEntity.processDescription}</dd>
        </dl>
        <Button tag={Link} to="/process" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/process/${processEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default ProcessDetail;
