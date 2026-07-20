import './activity-detail-drawer.scss';

import React, { useCallback } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { translate } from 'react-jhipster';

import { useAppSelector } from 'app/config/store';
import { ActivityDetailEditor } from './activity-detail-editor';

export interface ActivityDetailDrawerProps {
  activityId: number | null;
  processId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  onDelete?: (activity: { id: number; name: string }) => void;
  onDuplicated?: (activityId: number) => void;
  deleting?: boolean;
}

export const ActivityDetailDrawer = ({
  activityId,
  processId,
  isOpen,
  onClose,
  onSaved,
  onDelete,
  onDuplicated,
  deleting = false,
}: ActivityDetailDrawerProps) => {
  const activityEntity = useAppSelector(state => state.activity.entity);
  const draftName = activityEntity.id === activityId ? activityEntity.name : undefined;
  const drawerTitle = draftName ?? translate('processComposerApp.processDesign.drawer.title', 'Activity details');
  const drawerPhaseName = activityEntity.id === activityId ? activityEntity.phase?.name : undefined;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
        <div className="activity-detail-drawer__header-content">
          <div className="activity-detail-drawer__title-block">
            <span className="activity-detail-drawer__title">{drawerTitle}</span>
            {drawerPhaseName && <p className="activity-detail-drawer__subtitle">{drawerPhaseName}</p>}
          </div>
        </div>
      </OffcanvasHeader>

      <OffcanvasBody>
        <ActivityDetailEditor
          activityId={isOpen ? activityId : null}
          processId={processId}
          variant="drawer"
          showHeaderActions
          onSaved={onSaved}
          onDelete={onDelete}
          onDuplicated={onDuplicated}
          deleting={deleting}
        />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ActivityDetailDrawer;
