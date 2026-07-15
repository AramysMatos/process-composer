import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getActivities } from 'app/entities/activity/activity.reducer';
import { ITemplates } from 'app/shared/model/templates.model';
import { getEntities as getTemplates } from 'app/entities/templates/templates.reducer';
import { IGuidelines } from 'app/shared/model/guidelines.model';
import { getEntities as getGuidelines } from 'app/entities/guidelines/guidelines.reducer';
import { IRoles } from 'app/shared/model/roles.model';
import { getEntities as getRoles } from 'app/entities/roles/roles.reducer';
import { ITools } from 'app/shared/model/tools.model';
import { getEntities as getTools } from 'app/entities/tools/tools.reducer';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { getEntities as getArtifacts } from 'app/entities/artifacts/artifacts.reducer';
import { IPhase } from 'app/shared/model/phase.model';
import { getEntities as getPhases } from 'app/entities/phase/phase.reducer';
import { ITask } from 'app/shared/model/task.model';
import { getEntities as getTasks } from 'app/entities/task/task.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { getEntity, updateEntity, createEntity, reset } from './activity.reducer';

export const ActivityUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const activities = useAppSelector(state => state.activity.entities);
  const templates = useAppSelector(state => state.templates.entities);
  const guidelines = useAppSelector(state => state.guidelines.entities);
  const roles = useAppSelector(state => state.roles.entities);
  const tools = useAppSelector(state => state.tools.entities);
  const artifacts = useAppSelector(state => state.artifacts.entities);
  const phases = useAppSelector(state => state.phase.entities);
  const tasks = useAppSelector(state => state.task.entities);
  const activityEntity = useAppSelector(state => state.activity.entity);
  const loading = useAppSelector(state => state.activity.loading);
  const updating = useAppSelector(state => state.activity.updating);
  const updateSuccess = useAppSelector(state => state.activity.updateSuccess);

  const handleClose = () => {
    navigate('/activity');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getActivities({}));
    dispatch(getTemplates({}));
    dispatch(getGuidelines({}));
    dispatch(getRoles({}));
    dispatch(getTools({}));
    dispatch(getArtifacts({}));
    dispatch(getPhases({}));
    dispatch(getTasks({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...activityEntity,
      ...values,
      subActivities: mapIdList(values.subActivities),
      templates: mapIdList(values.templates),
      guidelines: mapIdList(values.guidelines),
      participantRoles: mapIdList(values.participantRoles),
      responsibleRoles: mapIdList(values.responsibleRoles),
      tools: mapIdList(values.tools),
      requiredArtifacts: mapIdList(values.requiredArtifacts),
      producedArtifacts: mapIdList(values.producedArtifacts),
      phase: phases.find(it => it.id.toString() === values.phase.toString()),
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
          ...activityEntity,
          subActivities: activityEntity?.subActivities?.map(e => e.id.toString()),
          templates: activityEntity?.templates?.map(e => e.id.toString()),
          guidelines: activityEntity?.guidelines?.map(e => e.id.toString()),
          participantRoles: activityEntity?.participantRoles?.map(e => e.id.toString()),
          responsibleRoles: activityEntity?.responsibleRoles?.map(e => e.id.toString()),
          tools: activityEntity?.tools?.map(e => e.id.toString()),
          requiredArtifacts: activityEntity?.requiredArtifacts?.map(e => e.id.toString()),
          producedArtifacts: activityEntity?.producedArtifacts?.map(e => e.id.toString()),
          phase: activityEntity?.phase?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="processComposerApp.activity.home.createOrEditLabel" data-cy="ActivityCreateUpdateHeading">
            <Translate contentKey="processComposerApp.activity.home.createOrEditLabel">Create or edit a Activity</Translate>
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
                  id="activity-id"
                  label={translate('global.field.id')}
                  validate={{ required: true }}
                />
              ) : null}
              <ValidatedField
                label={translate('processComposerApp.activity.name')}
                id="activity-name"
                name="name"
                data-cy="name"
                type="text"
              />
              <ValidatedField
                label={translate('processComposerApp.activity.description')}
                id="activity-description"
                name="description"
                data-cy="description"
                type="text"
              />
              <ValidatedField
                label={translate('processComposerApp.activity.inputCriterion')}
                id="activity-inputCriterion"
                name="inputCriterion"
                data-cy="inputCriterion"
                type="text"
              />
              <ValidatedField
                label={translate('processComposerApp.activity.subActivities')}
                id="activity-subActivities"
                data-cy="subActivities"
                type="select"
                multiple
                name="subActivities"
              >
                <option value="" key="0" />
                {activities
                  ? activities.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.templates')}
                id="activity-templates"
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
              <ValidatedField
                label={translate('processComposerApp.activity.guidelines')}
                id="activity-guidelines"
                data-cy="guidelines"
                type="select"
                multiple
                name="guidelines"
              >
                <option value="" key="0" />
                {guidelines
                  ? guidelines.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.participantRoles')}
                id="activity-participantRoles"
                data-cy="participantRoles"
                type="select"
                multiple
                name="participantRoles"
              >
                <option value="" key="0" />
                {roles
                  ? roles.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.responsibleRoles')}
                id="activity-responsibleRoles"
                data-cy="responsibleRoles"
                type="select"
                multiple
                name="responsibleRoles"
              >
                <option value="" key="0" />
                {roles
                  ? roles.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.tools')}
                id="activity-tools"
                data-cy="tools"
                type="select"
                multiple
                name="tools"
              >
                <option value="" key="0" />
                {tools
                  ? tools.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.requiredArtifacts')}
                id="activity-requiredArtifacts"
                data-cy="requiredArtifacts"
                type="select"
                multiple
                name="requiredArtifacts"
              >
                <option value="" key="0" />
                {artifacts
                  ? artifacts.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                label={translate('processComposerApp.activity.producedArtifacts')}
                id="activity-producedArtifacts"
                data-cy="producedArtifacts"
                type="select"
                multiple
                name="producedArtifacts"
              >
                <option value="" key="0" />
                {artifacts
                  ? artifacts.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <ValidatedField
                id="activity-phase"
                name="phase"
                data-cy="phase"
                label={translate('processComposerApp.activity.phase')}
                type="select"
              >
                <option value="" key="0" />
                {phases
                  ? phases.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.name}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/activity" replace color="info">
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

export default ActivityUpdate;
