import './process-detail-drawer.scss';

import React, { useCallback } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { translate } from 'react-jhipster';

import { useAppSelector } from 'app/config/store';
import { ProcessDetailEditor } from 'app/modules/process-design/components/process-detail-editor/process-detail-editor';

export interface ProcessDetailDrawerProps {
  processId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ProcessDetailDrawer = ({ processId, isOpen, onClose, onSaved }: ProcessDetailDrawerProps) => {
  const processEntity = useAppSelector(state => state.process.entity);
  const draftName = processEntity.id === processId ? processEntity.processName : undefined;
  const drawerTitle = draftName ?? translate('processComposerApp.processDesign.processDrawer.title', 'Process details');

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={handleClose}
      direction="end"
      className="process-detail-drawer"
      style={{ width: 'min(36rem, 100vw)' }}
      data-cy="process-detail-drawer"
    >
      <OffcanvasHeader toggle={handleClose} className="process-detail-drawer__header">
        <div className="process-detail-drawer__header-content">
          <div className="process-detail-drawer__title-block">
            <span className="process-detail-drawer__title">{drawerTitle}</span>
          </div>
        </div>
      </OffcanvasHeader>

      <OffcanvasBody>
        <ProcessDetailEditor processId={isOpen ? processId : null} onSaved={onSaved} />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ProcessDetailDrawer;
