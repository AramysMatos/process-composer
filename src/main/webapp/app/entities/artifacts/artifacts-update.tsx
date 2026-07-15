import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { ITemplates } from 'app/shared/model/templates.model';
import { getEntities as getTemplates } from 'app/entities/templates/templates.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { getEntity, updateEntity, createEntity, reset } from './artifacts.reducer';

export const ArtifactsUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const templates = useAppSelector(state => state.templates.entities);
  const activities = useAppSelector(state => state.activity.entities);
  const artifactsEntity = useAppSelector(state => state.artifacts.entity);
  const loading = useAppSelector(state => state.artifacts.loading);
  const updating = useAppSelector(state => state.artifacts.updating);
  const updateSuccess = useAppSelector(state => state.artifacts.updateSuccess);

  const handleClose = () => {
    navigate('/artifacts');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getTemplates({}));
    dispatch(getActivities({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...artifactsEntity,
      ...values,
      templates: mapIdList(values.templates),
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
          ...artifactsEntity,
          templates: artifactsEntity?.templates?.map(e => e.id.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="processComposerApp.artifacts.home.createOrEditLabel" data-cy="ArtifactsCreateUpdateHeading">
            <Translate contentKey="processComposerApp.artifacts.home.createOrEditLabel">Create or edit a Artifacts</Translate>
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
                  id="artifacts-id"
                  label={translate('global.field.id')}
                  validate={{ required: true }}
                />
              ) : null}
              <ValidatedField
                label={translate('processComposerApp.artifacts.name')}
                id="artifacts-name"
                name="name"
                data-cy="name"
                type="text"
              />
              <ValidatedField
                label={translate('processComposerApp.artifacts.description')}
                id="artifacts-description"
                name="description"
                data-cy="description"
                type="text"
              />
              <ValidatedField
                label={translate('processComposerApp.artifacts.optional')}
                id="artifacts-optional"
                name="optional"
                data-cy="optional"
                check
                type="checkbox"
              />
              <ValidatedField
                label={translate('processComposerApp.artifacts.templates')}
                id="artifacts-templates"
                data-cy="templates"
                type="select"
                multiple
                name="templates"
              >
                <option value="" key="0" />
                {templates
                  ? templates.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/artifacts" replace color="info">
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

export default ArtifactsUpdate;
