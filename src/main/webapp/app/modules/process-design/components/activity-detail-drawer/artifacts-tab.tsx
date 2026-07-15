import React, { useEffect, useMemo } from 'react';
import { Col, FormGroup, Label, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createArtifact, getEntities as getArtifacts } from 'app/entities/artifacts/artifacts.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { EntityComboboxCreatable } from 'app/shared-ui/entity-combobox-creatable';
import { toComboboxItems } from './activity-drawer.utils';

export interface ArtifactsTabProps {
  draft: IActivity;
  onChange: (updated: IActivity) => void;
  disabled?: boolean;
}

export const ArtifactsTab = ({ draft, onChange, disabled = false }: ArtifactsTabProps) => {
  const dispatch = useAppDispatch();
  const artifacts = useAppSelector(state => state.artifacts.entities);

  useEffect(() => {
    dispatch(getArtifacts({}));
  }, [dispatch]);

  const artifactOptions = useMemo(() => toComboboxItems(artifacts), [artifacts]);

  const handleCreateRequired = async (name: string) => {
    const { data: created } = await dispatch(createArtifact({ name })).unwrap();
    onChange({ ...draft, requiredArtifacts: [...(draft.requiredArtifacts ?? []), created] });
  };

  const handleCreateProduced = async (name: string) => {
    const { data: created } = await dispatch(createArtifact({ name })).unwrap();
    onChange({ ...draft, producedArtifacts: [...(draft.producedArtifacts ?? []), created] });
  };

  return (
    <div className="activity-detail-drawer__artifacts-tab">
      <Row className="g-3">
        <Col md={6}>
          <div className="artifacts-tab__column artifacts-tab__column--input">
            <div className="artifacts-tab__column-title">
              <FontAwesomeIcon icon="arrow-right" />
              <Translate contentKey="processComposerApp.processDesign.drawer.artifacts.input">Input</Translate>
            </div>
            <FormGroup>
              <Label className="visually-hidden" for="activity-drawer-required-artifacts">
                <Translate contentKey="processComposerApp.processDesign.drawer.artifacts.requiredArtifacts">Required artifacts</Translate>
              </Label>
              <EntityComboboxCreatable
                id="activity-drawer-required-artifacts"
                options={artifactOptions}
                value={toComboboxItems(draft.requiredArtifacts)}
                onChange={selected =>
                  onChange({
                    ...draft,
                    requiredArtifacts: selected.map(item => ({ id: item.id, name: item.name })),
                  })
                }
                onCreateNew={handleCreateRequired}
                disabled={disabled}
                data-cy="activity-drawer-required-artifacts"
              />
            </FormGroup>
          </div>
        </Col>

        <Col md={6}>
          <div className="artifacts-tab__column artifacts-tab__column--output">
            <div className="artifacts-tab__column-title">
              <FontAwesomeIcon icon="arrow-right" rotation={180} />
              <Translate contentKey="processComposerApp.processDesign.drawer.artifacts.output">Output</Translate>
            </div>
            <FormGroup>
              <Label className="visually-hidden" for="activity-drawer-produced-artifacts">
                <Translate contentKey="processComposerApp.processDesign.drawer.artifacts.producedArtifacts">Produced artifacts</Translate>
              </Label>
              <EntityComboboxCreatable
                id="activity-drawer-produced-artifacts"
                options={artifactOptions}
                value={toComboboxItems(draft.producedArtifacts)}
                onChange={selected =>
                  onChange({
                    ...draft,
                    producedArtifacts: selected.map(item => ({ id: item.id, name: item.name })),
                  })
                }
                onCreateNew={handleCreateProduced}
                disabled={disabled}
                data-cy="activity-drawer-produced-artifacts"
              />
            </FormGroup>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ArtifactsTab;
