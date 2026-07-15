import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { IActivity } from 'app/shared/model/activity.model';

export interface GeneralTabProps {
  draft: IActivity;
  onChange: (updated: IActivity) => void;
  disabled?: boolean;
}

export const GeneralTab = ({ draft, onChange, disabled = false }: GeneralTabProps) => (
  <div className="activity-detail-drawer__general-tab">
    <FormGroup>
      <Label for="activity-drawer-name">
        <Translate contentKey="processComposerApp.processDesign.drawer.general.name">Name</Translate>
      </Label>
      <Input
        id="activity-drawer-name"
        value={draft.name ?? ''}
        disabled={disabled}
        onChange={event => onChange({ ...draft, name: event.target.value })}
        data-cy="activity-drawer-name"
      />
    </FormGroup>

    <FormGroup>
      <Label for="activity-drawer-description">
        <Translate contentKey="processComposerApp.processDesign.drawer.general.description">Description</Translate>
      </Label>
      <Input
        id="activity-drawer-description"
        type="textarea"
        rows={4}
        value={draft.description ?? ''}
        disabled={disabled}
        onChange={event => onChange({ ...draft, description: event.target.value })}
        data-cy="activity-drawer-description"
      />
    </FormGroup>

    <FormGroup>
      <Label for="activity-drawer-input-criterion">
        <Translate contentKey="processComposerApp.processDesign.drawer.general.inputCriterion">Input criterion</Translate>
      </Label>
      <Input
        id="activity-drawer-input-criterion"
        type="textarea"
        rows={3}
        value={draft.inputCriterion ?? ''}
        disabled={disabled}
        onChange={event => onChange({ ...draft, inputCriterion: event.target.value })}
        data-cy="activity-drawer-input-criterion"
      />
    </FormGroup>
  </div>
);

export default GeneralTab;
