import './project-detail-drawer.scss';

import React, { useCallback } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { translate } from 'react-jhipster';

import { useAppSelector } from 'app/config/store';
import { ProjectDetailEditor } from 'app/modules/execution/components/project-detail-editor/project-detail-editor';

export interface ProjectDetailDrawerProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ProjectDetailDrawer = ({ projectId, isOpen, onClose, onSaved }: ProjectDetailDrawerProps) => {
  const projectEntity = useAppSelector(state => state.project.entity);
  const draftName = projectEntity.id === projectId ? projectEntity.name : undefined;
  const drawerTitle = draftName ?? translate('processComposerApp.execution.projectDrawer.title', 'Project details');

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={handleClose}
      direction="end"
      className="project-detail-drawer"
      style={{ width: 'min(36rem, 100vw)' }}
      data-cy="project-detail-drawer"
    >
      <OffcanvasHeader toggle={handleClose} className="project-detail-drawer__header">
        <div className="project-detail-drawer__header-content">
          <div className="project-detail-drawer__title-block">
            <span className="project-detail-drawer__title">{drawerTitle}</span>
          </div>
        </div>
      </OffcanvasHeader>

      <OffcanvasBody>
        <ProjectDetailEditor projectId={isOpen ? projectId : null} onSaved={onSaved} />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ProjectDetailDrawer;
