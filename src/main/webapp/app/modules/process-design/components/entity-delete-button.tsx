import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './entity-delete-button.scss';

export interface EntityDeleteButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  'data-cy'?: string;
}

export const EntityDeleteButton = ({ label, onClick, disabled = false, 'data-cy': dataCy }: EntityDeleteButtonProps) => (
  <button
    type="button"
    className="entity-delete-button"
    aria-label={label}
    disabled={disabled}
    data-cy={dataCy}
    onClick={event => {
      event.stopPropagation();
      onClick();
    }}
  >
    <FontAwesomeIcon icon="trash" />
  </button>
);

export default EntityDeleteButton;
