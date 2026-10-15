import './process-header-actions.scss';

import React, { useMemo } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { CardActionsMenu } from 'app/shared-ui/card-actions-menu';
import { buildProcessHeaderMenuItems, BuildProcessHeaderMenuItemsParams } from 'app/modules/process-design/process-header-menu-items';

export type ProcessHeaderActionsProps = BuildProcessHeaderMenuItemsParams & {
  menuDataCy: string;
};

export const ProcessHeaderActions = ({
  processId,
  menuDataCy,
  readOnly,
  onEdit,
  onDuplicate,
  onDownloadStaticSite,
  duplicatingProcess,
  downloadingStaticSite,
  deletingProcess,
  onRequestDelete,
  canPromoteToSystemTemplate,
  onPromoteToSystemTemplate,
  promotingToSystemTemplate,
}: ProcessHeaderActionsProps) => {
  const menuItems = useMemo(
    () =>
      buildProcessHeaderMenuItems({
        processId,
        readOnly,
        onEdit,
        onDuplicate,
        onDownloadStaticSite,
        duplicatingProcess,
        downloadingStaticSite,
        deletingProcess,
        onRequestDelete,
        canPromoteToSystemTemplate,
        onPromoteToSystemTemplate,
        promotingToSystemTemplate,
      }),
    [
      canPromoteToSystemTemplate,
      deletingProcess,
      downloadingStaticSite,
      duplicatingProcess,
      onDownloadStaticSite,
      onDuplicate,
      onEdit,
      onPromoteToSystemTemplate,
      onRequestDelete,
      processId,
      promotingToSystemTemplate,
      readOnly,
    ]
  );

  const openDocumentation = () => {
    window.open(`/processos/${processId}/visualizar`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="process-header-actions">
      <Button color="secondary" outline size="sm" onClick={openDocumentation} data-cy={`processVisualize-${processId}`}>
        <FontAwesomeIcon icon="book" className="me-1" />
        <Translate contentKey="processComposerApp.processDesign.list.actions.documentation">Documentation</Translate>
      </Button>
      <CardActionsMenu data-cy={menuDataCy} items={menuItems} />
    </div>
  );
};

export default ProcessHeaderActions;
