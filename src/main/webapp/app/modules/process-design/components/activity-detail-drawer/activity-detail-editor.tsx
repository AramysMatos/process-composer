import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Nav, NavItem, NavLink, Spinner, TabContent, TabPane } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { deleteEntity, getEntity, updateEntity, updateEntitySilent } from 'app/entities/activity/activity.reducer';
import { duplicateActivity } from 'app/modules/process-design/duplicate-activity';
import { IActivity } from 'app/shared/model/activity.model';
import { CardActionsMenu, CardActionItem } from 'app/shared-ui/card-actions-menu';
import { ArtifactsTab } from './artifacts-tab';
import { cloneActivityDraft, collectDependencySyncUpdates, toActivityUpdatePayload } from './activity-drawer.utils';
import { DependenciesTab } from './dependencies-tab';
import { GeneralTab } from './general-tab';
import { ResourcesTab } from './resources-tab';
import { RolesTab } from './roles-tab';

type ActivitySection = 'general' | 'roles' | 'resources' | 'artifacts' | 'dependencies';

const ALL_SECTIONS: ActivitySection[] = ['general', 'roles', 'resources', 'artifacts', 'dependencies'];
const LIBRARY_SECTIONS: ActivitySection[] = ['general', 'roles', 'resources', 'artifacts', 'dependencies'];

export interface ActivityDetailEditorProps {
  activityId: number | null;
  processId?: number;
  phaseId?: number;
  variant?: 'drawer' | 'panel';
  embeddedInPhase?: boolean;
  showHeaderActions?: boolean;
  onSaved?: () => void;
  onDelete?: (activity: { id: number; name: string }) => void;
  onDeleted?: () => void;
  onDuplicated?: (activityId: number) => void;
  deleting?: boolean;
}

export const ActivityDetailEditor = ({
  activityId,
  processId,
  phaseId,
  variant = 'drawer',
  embeddedInPhase = false,
  showHeaderActions = true,
  onSaved,
  onDelete,
  onDeleted,
  onDuplicated,
  deleting = false,
}: ActivityDetailEditorProps) => {
  const dispatch = useAppDispatch();
  const isLibraryContext = processId === undefined;
  const useSectionsLayout = variant === 'panel';

  const activityEntity = useAppSelector(state => state.activity.entity);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const loading = useAppSelector(state => state.activity.loading);
  const updating = useAppSelector(state => state.activity.updating);

  const visibleSections = isLibraryContext ? LIBRARY_SECTIONS : ALL_SECTIONS;

  const [activeTab, setActiveTab] = useState<ActivitySection>('general');
  const [draft, setDraft] = useState<IActivity | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const originalSnapshotRef = useRef<IActivity | null>(null);

  const activitiesById = useMemo(() => {
    const map = new Map<number, IActivity>();
    activityEntities.forEach(activity => {
      if (activity.id !== undefined) {
        map.set(activity.id, activity);
      }
    });
    return map;
  }, [activityEntities]);

  useEffect(() => {
    if (!activityId) {
      setDraft(null);
      originalSnapshotRef.current = null;
      setActiveTab('general');
      setSaveError(null);
      setDuplicating(false);
      return;
    }

    dispatch(getEntity(activityId));
  }, [activityId, dispatch]);

  useEffect(() => {
    if (!activityId || activityEntity.id !== activityId) {
      return;
    }
    const snapshot = cloneActivityDraft(activityEntity);
    originalSnapshotRef.current = snapshot;
    setDraft(snapshot);
  }, [activityEntity, activityId]);

  const handleSave = async () => {
    if (!draft?.id) {
      return;
    }

    setSaveError(null);

    try {
      const original = originalSnapshotRef.current;
      if (original) {
        const dependencyUpdates = collectDependencySyncUpdates(original, draft, activitiesById);
        for (const relatedActivity of dependencyUpdates) {
          await dispatch(updateEntitySilent(toActivityUpdatePayload(relatedActivity))).unwrap();
        }
      }

      await dispatch(updateEntity(toActivityUpdatePayload(draft))).unwrap();
      await dispatch(getEntity(draft.id));
      originalSnapshotRef.current = cloneActivityDraft(draft);
      toast.success(translate('processComposerApp.processDesign.drawer.saveSuccess', 'Activity saved successfully.'));
      onSaved?.();
    } catch {
      setSaveError(translate('processComposerApp.processDesign.drawer.saveError', 'Could not save the activity.'));
    }
  };

  const handleDelete = useCallback(async () => {
    if (!draft?.id) {
      return;
    }

    if (onDelete) {
      onDelete({
        id: draft.id,
        name: draft.name ?? '',
      });
      return;
    }

    try {
      await dispatch(deleteEntity(draft.id)).unwrap();
      toast.success(translate('entity.delete.success', 'Deleted successfully.'));
      onDeleted?.();
    } catch {
      toast.error(translate('entity.delete.fail', 'Delete failed.'));
    }
  }, [dispatch, draft, onDelete, onDeleted]);

  const handleDuplicate = async () => {
    if (!draft?.id || duplicating) {
      return;
    }

    setDuplicating(true);
    try {
      const newActivityId = await duplicateActivity(dispatch, draft.id);
      toast.success(translate('processComposerApp.processDesign.drawer.duplicateSuccess', 'Activity duplicated successfully.'));
      onDuplicated?.(newActivityId);
    } catch {
      toast.error(translate('processComposerApp.processDesign.drawer.duplicateError', 'Could not duplicate the activity.'));
    } finally {
      setDuplicating(false);
    }
  };

  const isLoading = loading || (!draft && activityId !== null);
  const isBusy = updating || deleting || duplicating;
  const effectivePhaseId = phaseId ?? draft?.phase?.id;

  const menuItems: CardActionItem[] = [];
  if (draft?.id && showHeaderActions) {
    if (!isLibraryContext) {
      menuItems.push({
        key: 'duplicate',
        label: (
          <>
            <FontAwesomeIcon icon="copy" className="me-2" />
            <Translate contentKey="processComposerApp.processDesign.drawer.duplicate">Duplicate activity</Translate>
          </>
        ),
        onClick() {
          void handleDuplicate();
        },
        disabled: isBusy,
        'data-cy': `activityDuplicate-${draft.id}`,
      });
    }
    menuItems.push({
      key: 'delete',
      label: (
        <>
          <FontAwesomeIcon icon="trash" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.delete.deleteActivity">Delete activity</Translate>
        </>
      ),
      onClick() {
        void handleDelete();
      },
      danger: true,
      disabled: isBusy,
      'data-cy': `activityDelete-${draft.id}`,
    });
  }

  if (!activityId) {
    return null;
  }

  const renderSectionContent = (section: ActivitySection) => {
    if (!draft) {
      return null;
    }

    switch (section) {
      case 'general':
        return <GeneralTab draft={draft} onChange={setDraft} disabled={updating} />;
      case 'roles':
        return <RolesTab draft={draft} onChange={setDraft} disabled={updating} />;
      case 'resources':
        return <ResourcesTab draft={draft} onChange={setDraft} disabled={updating} />;
      case 'artifacts':
        return <ArtifactsTab draft={draft} onChange={setDraft} disabled={updating} />;
      case 'dependencies':
        return <DependenciesTab draft={draft} processId={processId} phaseId={effectivePhaseId} onChange={setDraft} disabled={updating} />;
      default:
        return null;
    }
  };

  const saveButton = (
    <Button color="primary" onClick={handleSave} disabled={isBusy} data-cy="activity-drawer-save">
      {updating ? (
        <Translate contentKey="processComposerApp.processDesign.drawer.saving">Saving...</Translate>
      ) : (
        <Translate contentKey="processComposerApp.processDesign.drawer.save">Save</Translate>
      )}
    </Button>
  );

  return (
    <div className={`activity-detail-editor activity-detail-editor--${variant}`} data-cy="activity-detail-editor">
      {variant === 'panel' && draft && !embeddedInPhase && (
        <div className="activity-detail-editor__panel-header">
          <div className="activity-detail-editor__title-block">
            <h2 className="h5 mb-0">{draft.name}</h2>
            {draft.phase?.name && <p className="text-muted small mb-0">{draft.phase.name}</p>}
          </div>
          {menuItems.length > 0 && <CardActionsMenu data-cy={`activityEditorMenu-${draft.id}`} items={menuItems} />}
        </div>
      )}

      {variant === 'panel' && draft && embeddedInPhase && (
        <div className="activity-detail-editor__embedded-header mb-3 d-flex justify-content-between align-items-start gap-2">
          <h4 className="activity-detail-editor__embedded-title h6 mb-0" data-cy="phase-activity-name">
            {draft.name}
          </h4>
          {menuItems.length > 0 && <CardActionsMenu data-cy={`activityEditorMenu-${draft.id}`} items={menuItems} />}
        </div>
      )}

      {variant === 'drawer' && menuItems.length > 0 && (
        <div className="activity-detail-editor__drawer-actions mb-3 d-flex justify-content-end">
          <CardActionsMenu data-cy={`activityEditorMenu-${draft?.id}`} items={menuItems} />
        </div>
      )}

      {saveError && (
        <Alert color="danger" toggle={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {isLoading && (
        <div className="activity-detail-drawer__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!isLoading && draft && useSectionsLayout && (
        <>
          <div className="activity-detail-editor__sections">
            {visibleSections.map(section => (
              <section key={section} className="activity-detail-editor__section" data-cy={`activity-section-${section}`}>
                <h3 className="activity-detail-editor__section-title">
                  <Translate contentKey={`processComposerApp.processDesign.drawer.tabs.${section}`}>{section}</Translate>
                </h3>
                {renderSectionContent(section)}
              </section>
            ))}
          </div>

          <div className="activity-detail-drawer__footer">
            <div className="activity-detail-drawer__footer-actions">{saveButton}</div>
          </div>
        </>
      )}

      {!isLoading && draft && !useSectionsLayout && (
        <>
          <Nav tabs className="activity-detail-drawer__tabs">
            {visibleSections.map(tab => (
              <NavItem key={tab}>
                <NavLink
                  className={activeTab === tab ? 'active' : ''}
                  onClick={event => {
                    event.preventDefault();
                    setActiveTab(tab);
                  }}
                  href="#"
                  data-cy={`activity-drawer-tab-${tab}`}
                >
                  <Translate contentKey={`processComposerApp.processDesign.drawer.tabs.${tab}`}>{tab}</Translate>
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="general">{renderSectionContent('general')}</TabPane>
            <TabPane tabId="roles">{renderSectionContent('roles')}</TabPane>
            <TabPane tabId="resources">{renderSectionContent('resources')}</TabPane>
            <TabPane tabId="artifacts">{renderSectionContent('artifacts')}</TabPane>
            <TabPane tabId="dependencies">{renderSectionContent('dependencies')}</TabPane>
          </TabContent>

          <div className="activity-detail-drawer__footer">
            <div className="activity-detail-drawer__footer-actions">{saveButton}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityDetailEditor;
