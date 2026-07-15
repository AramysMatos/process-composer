import React, { useEffect, useMemo } from 'react';
import { FormGroup, Label } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createRole, getEntities as getRoles } from 'app/entities/roles/roles.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { EntityComboboxCreatable } from 'app/shared-ui/entity-combobox-creatable';
import { toComboboxItems } from './activity-drawer.utils';

export interface RolesTabProps {
  draft: IActivity;
  onChange: (updated: IActivity) => void;
  disabled?: boolean;
}

export const RolesTab = ({ draft, onChange, disabled = false }: RolesTabProps) => {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(state => state.roles.entities);

  useEffect(() => {
    dispatch(getRoles({}));
  }, [dispatch]);

  const roleOptions = useMemo(() => toComboboxItems(roles), [roles]);

  const handleCreateParticipantRole = async (name: string) => {
    const { data: created } = await dispatch(createRole({ name })).unwrap();
    onChange({
      ...draft,
      participantRoles: [...(draft.participantRoles ?? []), created],
    });
  };

  const handleCreateResponsibleRole = async (name: string) => {
    const { data: created } = await dispatch(createRole({ name })).unwrap();
    onChange({
      ...draft,
      responsibleRoles: [...(draft.responsibleRoles ?? []), created],
    });
  };

  return (
    <div className="activity-detail-drawer__roles-tab">
      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-participant-roles">
          <Translate contentKey="processComposerApp.processDesign.drawer.roles.participantRoles">Participant roles</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-participant-roles"
          options={roleOptions}
          value={toComboboxItems(draft.participantRoles)}
          onChange={selected =>
            onChange({
              ...draft,
              participantRoles: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          onCreateNew={handleCreateParticipantRole}
          disabled={disabled}
          data-cy="activity-drawer-participant-roles"
        />
      </FormGroup>

      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-responsible-roles">
          <Translate contentKey="processComposerApp.processDesign.drawer.roles.responsibleRoles">Responsible role(s)</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-responsible-roles"
          options={roleOptions}
          value={toComboboxItems(draft.responsibleRoles)}
          onChange={selected =>
            onChange({
              ...draft,
              responsibleRoles: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          onCreateNew={handleCreateResponsibleRole}
          disabled={disabled}
          data-cy="activity-drawer-responsible-roles"
        />
      </FormGroup>
    </div>
  );
};

export default RolesTab;
