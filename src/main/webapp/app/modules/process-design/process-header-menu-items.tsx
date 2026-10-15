import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import { CardActionItem } from 'app/shared-ui/card-actions-menu';

export type BuildProcessHeaderMenuItemsParams = {
  processId: number;
  readOnly: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownloadStaticSite: () => void;
  duplicatingProcess: boolean;
  downloadingStaticSite: boolean;
  deletingProcess: boolean;
  onRequestDelete: () => void;
  canPromoteToSystemTemplate?: boolean;
  onPromoteToSystemTemplate?: () => void;
  promotingToSystemTemplate?: boolean;
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
  canPromoteToSystemTemplate = false,
  onPromoteToSystemTemplate,
  promotingToSystemTemplate = false,
}: BuildProcessHeaderMenuItemsParams): CardActionItem[] => {
  const items: CardActionItem[] = [];

  if (!readOnly) {
    items.push({
      key: 'edit',
      label: (
        <>
          <FontAwesomeIcon icon="pencil-alt" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.editNameAndDescription">Edit name and description</Translate>
        </>
      ),
      onClick: onEdit,
      'data-cy': `processEdit-${processId}`,
    });
  }

  items.push({
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
  });

  if (canPromoteToSystemTemplate && onPromoteToSystemTemplate) {
    items.push({
      key: 'promoteSystemTemplate',
      label: (
        <>
          <FontAwesomeIcon icon="bookmark" className="me-2" />
          <Translate contentKey="processComposerApp.processDesign.list.actions.promoteToSystemTemplate">Save as system model</Translate>
        </>
      ),
      onClick: onPromoteToSystemTemplate,
      disabled: promotingToSystemTemplate,
      'data-cy': `processPromoteSystemTemplate-${processId}`,
    });
  }

  items.push(
    {
      key: 'export',
      dividerBefore: true,
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
      dividerBefore: true,
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
