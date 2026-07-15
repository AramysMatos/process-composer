import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './guidelines.reducer';

export const GuidelinesDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const guidelinesEntity = useAppSelector(state => state.guidelines.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="guidelinesDetailsHeading">
          <Translate contentKey="processComposerApp.guidelines.detail.title">Guidelines</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{guidelinesEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="processComposerApp.guidelines.name">Name</Translate>
            </span>
          </dt>
          <dd>{guidelinesEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="processComposerApp.guidelines.description">Description</Translate>
            </span>
          </dt>
          <dd>{guidelinesEntity.description}</dd>
        </dl>
        <Button tag={Link} to="/guidelines" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/guidelines/${guidelinesEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default GuidelinesDetail;
