import './phase-detail-drawer.scss';

import React, { useCallback } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { translate } from 'react-jhipster';

import { useAppSelector } from 'app/config/store';
import { PhaseDetailEditor } from 'app/modules/process-design/components/phase-detail-editor/phase-detail-editor';

export interface PhaseDetailDrawerProps {
  phaseId: number | null;
  processId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  onDelete?: (phase: { id: number; name: string }) => void;
  deleting?: boolean;
}

export const PhaseDetailDrawer = ({ phaseId, processId, isOpen, onClose, onSaved, onDelete, deleting = false }: PhaseDetailDrawerProps) => {
  const phaseEntity = useAppSelector(state => state.phase.entity);
  const draftName = phaseEntity.id === phaseId ? phaseEntity.name : undefined;
  const drawerTitle = draftName ?? translate('processComposerApp.processDesign.phaseDrawer.title', 'Phase details');

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={handleClose}
      direction="end"
      className="phase-detail-drawer"
      style={{ width: 'min(36rem, 100vw)' }}
      data-cy="phase-detail-drawer"
    >
      <OffcanvasHeader toggle={handleClose} className="phase-detail-drawer__header">
        <div className="phase-detail-drawer__header-content">
          <div className="phase-detail-drawer__title-block">
            <span className="phase-detail-drawer__title">{drawerTitle}</span>
          </div>
        </div>
      </OffcanvasHeader>

      <OffcanvasBody>
        <PhaseDetailEditor
          phaseId={isOpen ? phaseId : null}
          processId={processId}
          variant="drawer"
          generalOnly
          showHeaderActions={false}
          onSaved={onSaved}
          onDelete={onDelete}
          deleting={deleting}
        />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default PhaseDetailDrawer;
