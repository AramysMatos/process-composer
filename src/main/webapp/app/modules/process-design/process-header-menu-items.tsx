import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { CardActionItem } from 'app/shared-ui/card-actions-menu';

type BuildProcessHeaderMenuItemsParams = {
  processId: number;
  readOnly: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownloadStaticSite: () => void;
  duplicatingProcess: boolean;
  downloadingStaticSite: boolean;
  deletingProcess: boolean;
  onRequestDelete: () => void;
};

export const buildProcessHeaderMenuItems = ({
  processId,
  readOnly,
  onEdit,
  onDuplicate,
  onDownloadStaticSite,
  duplicatingProcess,
  downloadingStaticSite,
  deletingProcess,
  onRequestDelete,
}: BuildProcessHeaderMenuItemsParams): CardActionItem[] => {
  const items: CardActionItem[] = [];

  if (!readOnly) {
    items.push({
      key: 'edit',
      label: (
        <>
          <FontAwesomeIcon icon="pencil-alt" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.edit">Edit process</Translate>
        </>
      ),
      onClick: onEdit,
      'data-cy': `processEdit-${processId}`,
    });
  }

  items.push(
    {
      key: 'duplicate',
      label: (
        <>
          <FontAwesomeIcon icon="copy" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.duplicate">Duplicate process</Translate>
        </>
      ),
      onClick: onDuplicate,
      disabled: duplicatingProcess,
      'data-cy': `processDuplicate-${processId}`,
    },
    {
      key: 'visualize',
      label: (
        <>
          <FontAwesomeIcon icon="book" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.visualize">View process site</Translate>
        </>
      ),
      onClick: () => window.open(`/processos/${processId}/visualizar`, '_blank', 'noopener,noreferrer'),
      'data-cy': `processVisualize-${processId}`,
    },
    {
      key: 'export',
      label: (
        <>
          <FontAwesomeIcon icon="file-code" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.exportYaml">Export YAML</Translate>
        </>
      ),
      to: `/processos/${processId}/exportar`,
      'data-cy': `processExportYaml-${processId}`,
    },
    {
      key: 'downloadStaticSite',
      label: (
        <>
          <FontAwesomeIcon icon="box" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.downloadStaticSite">Download static site</Translate>
        </>
      ),
      onClick: onDownloadStaticSite,
      disabled: downloadingStaticSite,
      'data-cy': `processDownloadStaticSite-${processId}`,
    }
  );

  if (!readOnly) {
    items.push({
      key: 'delete',
      label: (
        <>
          <FontAwesomeIcon icon="trash" className="me-2" />
          <Translate contentKey="entity.action.delete">Delete</Translate>
        </>
      ),
      onClick: onRequestDelete,
      danger: true,
      disabled: deletingProcess,
      'data-cy': `processDelete-${processId}`,
    });
  }

  return items;
};
