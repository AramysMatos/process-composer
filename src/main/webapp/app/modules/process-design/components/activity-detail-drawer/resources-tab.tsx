import React, { useEffect, useMemo } from 'react';
import { FormGroup, Label } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createTool, getEntities as getTools } from 'app/entities/tools/tools.reducer';
import { createEntity as createGuideline, getEntities as getGuidelines } from 'app/entities/guidelines/guidelines.reducer';
import { createEntity as createTemplate, getEntities as getTemplates } from 'app/entities/templates/templates.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { EntityComboboxCreatable } from 'app/shared-ui/entity-combobox-creatable';
import { toComboboxItems } from './activity-drawer.utils';

export interface ResourcesTabProps {
  draft: IActivity;
  onChange: (updated: IActivity) => void;
  disabled?: boolean;
}

export const ResourcesTab = ({ draft, onChange, disabled = false }: ResourcesTabProps) => {
  const dispatch = useAppDispatch();
  const tools = useAppSelector(state => state.tools.entities);
  const guidelines = useAppSelector(state => state.guidelines.entities);
  const templates = useAppSelector(state => state.templates.entities);

  useEffect(() => {
    dispatch(getTools({}));
    dispatch(getGuidelines({}));
    dispatch(getTemplates({}));
  }, [dispatch]);

  const toolOptions = useMemo(() => toComboboxItems(tools), [tools]);
  const guidelineOptions = useMemo(() => toComboboxItems(guidelines), [guidelines]);
  const templateOptions = useMemo(() => toComboboxItems(templates), [templates]);

  const handleCreateTool = async (name: string) => {
    const { data: created } = await dispatch(createTool({ name })).unwrap();
    onChange({ ...draft, tools: [...(draft.tools ?? []), created] });
  };

  const handleCreateGuideline = async (name: string) => {
    const { data: created } = await dispatch(createGuideline({ name })).unwrap();
    onChange({ ...draft, guidelines: [...(draft.guidelines ?? []), created] });
  };

  const handleCreateTemplate = async (name: string) => {
    const { data: created } = await dispatch(createTemplate({ name })).unwrap();
    onChange({ ...draft, templates: [...(draft.templates ?? []), created] });
  };

  return (
    <div className="activity-detail-drawer__resources-tab">
      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-tools">
          <Translate contentKey="processComposerApp.processDesign.drawer.resources.tools">Tools</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-tools"
          options={toolOptions}
          value={toComboboxItems(draft.tools)}
          onChange={selected =>
            onChange({
              ...draft,
              tools: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          onCreateNew={handleCreateTool}
          disabled={disabled}
          data-cy="activity-drawer-tools"
        />
      </FormGroup>

      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-guidelines">
          <Translate contentKey="processComposerApp.processDesign.drawer.resources.guidelines">Guidelines</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-guidelines"
          options={guidelineOptions}
          value={toComboboxItems(draft.guidelines)}
          onChange={selected =>
            onChange({
              ...draft,
              guidelines: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          onCreateNew={handleCreateGuideline}
          disabled={disabled}
          data-cy="activity-drawer-guidelines"
        />
      </FormGroup>

      <FormGroup className="activity-tab-section">
        <Label className="activity-tab-section__label" for="activity-drawer-templates">
          <Translate contentKey="processComposerApp.processDesign.drawer.resources.templates">Templates</Translate>
        </Label>
        <EntityComboboxCreatable
          id="activity-drawer-templates"
          options={templateOptions}
          value={toComboboxItems(draft.templates)}
          onChange={selected =>
            onChange({
              ...draft,
              templates: selected.map(item => ({ id: item.id, name: item.name })),
            })
          }
          onCreateNew={handleCreateTemplate}
          disabled={disabled}
          data-cy="activity-drawer-templates"
        />
      </FormGroup>
    </div>
  );
};

export default ResourcesTab;
