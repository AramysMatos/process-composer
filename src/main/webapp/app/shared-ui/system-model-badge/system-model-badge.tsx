import './system-model-badge.scss';

import React, { useId } from 'react';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

export interface SystemModelBadgeProps {
  description?: string;
  size?: 'default' | 'compact';
  'data-cy'?: string;
}

export const SystemModelBadge = ({ description, size = 'default', 'data-cy': dataCy }: SystemModelBadgeProps) => {
  const tooltipId = useId().replace(/:/g, '');
  const tooltipText =
    description ?? translate('global.systemModelBadge.tooltipProcess', 'You can view, export, and clone it, but not edit it.');

  return (
    <>
      <Badge
        color="info"
        tag="span"
        id={tooltipId}
        tabIndex={0}
        role="note"
        className={`system-model-badge${size === 'compact' ? ' system-model-badge--compact' : ''}`}
        data-cy={dataCy ?? 'system-model-badge'}
      >
        <FontAwesomeIcon icon="lock" className="system-model-badge__icon" aria-hidden />
        <span className="system-model-badge__label">
          <Translate contentKey="global.systemModelBadge.label">System model · Read-only</Translate>
        </span>
      </Badge>
      <UncontrolledTooltip target={tooltipId} placement="top">
        {tooltipText}
      </UncontrolledTooltip>
    </>
  );
};

export default SystemModelBadge;
