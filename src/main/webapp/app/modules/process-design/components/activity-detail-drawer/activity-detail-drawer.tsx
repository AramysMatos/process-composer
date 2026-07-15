import './activity-detail-drawer.scss';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Nav, NavItem, NavLink, Offcanvas, OffcanvasBody, OffcanvasHeader, Spinner, TabContent, TabPane } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity, updateEntity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { ArtifactsTab } from './artifacts-tab';
import { cloneActivityDraft, toActivityUpdatePayload } from './activity-drawer.utils';
import { DependenciesTab } from './dependencies-tab';
import { GeneralTab } from './general-tab';
import { ResourcesTab } from './resources-tab';
import { RolesTab } from './roles-tab';

type DrawerTab = 'general' | 'roles' | 'resources' | 'artifacts' | 'dependencies';

const DRAWER_TABS: DrawerTab[] = ['general', 'roles', 'resources', 'artifacts', 'dependencies'];

export interface ActivityDetailDrawerProps {
  activityId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ActivityDetailDrawer = ({ activityId, isOpen, onClose, onSaved }: ActivityDetailDrawerProps) => {
  const dispatch = useAppDispatch();

  const activityEntity = useAppSelector(state => state.activity.entity);
  const loading = useAppSelector(state => state.activity.loading);
  const updating = useAppSelector(state => state.activity.updating);

  const [activeTab, setActiveTab] = useState<DrawerTab>('general');
  const [draft, setDraft] = useState<IActivity | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDraft(null);
      setActiveTab('general');
      setSaveError(null);
      return;
    }

    if (activityId) {
      dispatch(getEntity(activityId));
    }
  }, [activityId, dispatch, isOpen]);

  useEffect(() => {
    if (!isOpen || !activityId || activityEntity.id !== activityId) {
      return;
    }
    setDraft(cloneActivityDraft(activityEntity));
  }, [activityEntity, activityId, isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    if (!draft?.id) {
      return;
    }

    setSaveError(null);

    try {
      await dispatch(updateEntity(toActivityUpdatePayload(draft))).unwrap();
      toast.success(translate('processComposerApp.processDesign.drawer.saveSuccess', 'Activity saved successfully.'));
      onSaved?.();
    } catch {
      setSaveError(translate('processComposerApp.processDesign.drawer.saveError', 'Could not save the activity.'));
    }
  };

  const isLoading = loading || (!draft && isOpen && activityId !== null);
  const drawerTitle = draft?.name ?? translate('processComposerApp.processDesign.drawer.title', 'Activity details');

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={handleClose}
      direction="end"
      className="activity-detail-drawer"
      style={{ width: 'min(36rem, 100vw)' }}
      data-cy="activity-detail-drawer"
    >
      <OffcanvasHeader toggle={handleClose} className="activity-detail-drawer__header">
        <div className="activity-detail-drawer__title-block">
          <span className="activity-detail-drawer__title">{drawerTitle}</span>
          {draft?.phase?.name && <p className="activity-detail-drawer__subtitle">{draft.phase.name}</p>}
        </div>
      </OffcanvasHeader>

      <OffcanvasBody>
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

        {!isLoading && draft && (
          <>
            <Nav tabs className="activity-detail-drawer__tabs">
              {DRAWER_TABS.map(tab => (
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
              <TabPane tabId="general">
                <GeneralTab draft={draft} onChange={setDraft} disabled={updating} />
              </TabPane>
              <TabPane tabId="roles">
                <RolesTab draft={draft} onChange={setDraft} disabled={updating} />
              </TabPane>
              <TabPane tabId="resources">
                <ResourcesTab draft={draft} onChange={setDraft} disabled={updating} />
              </TabPane>
              <TabPane tabId="artifacts">
                <ArtifactsTab draft={draft} onChange={setDraft} disabled={updating} />
              </TabPane>
              <TabPane tabId="dependencies">
                <DependenciesTab draft={draft} />
              </TabPane>
            </TabContent>

            <div className="activity-detail-drawer__footer">
              <Button color="secondary" outline onClick={handleClose} disabled={updating}>
                <Translate contentKey="entity.action.cancel">Cancel</Translate>
              </Button>
              <Button color="primary" onClick={handleSave} disabled={updating} data-cy="activity-drawer-save">
                {updating ? (
                  <Translate contentKey="processComposerApp.processDesign.drawer.saving">Saving...</Translate>
                ) : (
                  <Translate contentKey="processComposerApp.processDesign.drawer.save">Save</Translate>
                )}
              </Button>
            </div>
          </>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ActivityDetailDrawer;
