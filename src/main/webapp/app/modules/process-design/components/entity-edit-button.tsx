import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './entity-edit-button.scss';

export interface EntityEditButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  'data-cy'?: string;
}

export const EntityEditButton = ({ label, onClick, disabled = false, 'data-cy': dataCy }: EntityEditButtonProps) => (
  <button
    type="button"
    className="entity-edit-button"
    aria-label={label}
    disabled={disabled}
    data-cy={dataCy}
    onClick={event => {
      event.stopPropagation();
      onClick();
    }}
  >
    <FontAwesomeIcon icon="pencil-alt" />
  </button>
);

export default EntityEditButton;
