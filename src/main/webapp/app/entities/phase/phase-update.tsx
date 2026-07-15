import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IProcess } from 'app/shared/model/process.model';
import { getEntities as getProcesses } from 'app/entities/process/process.reducer';
import { IPhase } from 'app/shared/model/phase.model';
import { getEntity, updateEntity, createEntity, reset } from './phase.reducer';

export const PhaseUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const processes = useAppSelector(state => state.process.entities);
  const phaseEntity = useAppSelector(state => state.phase.entity);
  const loading = useAppSelector(state => state.phase.loading);
  const updating = useAppSelector(state => state.phase.updating);
  const updateSuccess = useAppSelector(state => state.phase.updateSuccess);

  const handleClose = () => {
    navigate('/phase');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getProcesses({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...phaseEntity,
      ...values,
      process: processes.find(it => it.id.toString() === values.process.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...phaseEntity,
          process: phaseEntity?.process?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="processComposerApp.phase.home.createOrEditLabel" data-cy="PhaseCreateUpdateHeading">
            <Translate contentKey="processComposerApp.phase.home.createOrEditLabel">Create or edit a Phase</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField
                  name="id"
                  required
                  readOnly
                  id="phase-id"
                  label={translate('global.field.id')}
                  validate={{ required: true }}
                />
              ) : null}
              <ValidatedField label={translate('processComposerApp.phase.name')} id="phase-name" name="name" data-cy="name" type="text" />
              <ValidatedField
                label={translate('processComposerApp.phase.description')}
                id="phase-description"
                name="description"
                data-cy="description"
                type="text"
              />
              <ValidatedField
                id="phase-process"
                name="process"
                data-cy="process"
                label={translate('processComposerApp.phase.process')}
                type="select"
              >
                <option value="" key="0" />
                {processes
                  ? processes.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.processName}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/phase" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PhaseUpdate;
