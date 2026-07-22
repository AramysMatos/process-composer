import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './entity-save-to-library-button.scss';

export interface EntitySaveToLibraryButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  'data-cy'?: string;
}

export const EntitySaveToLibraryButton = ({ label, onClick, disabled = false, 'data-cy': dataCy }: EntitySaveToLibraryButtonProps) => (
  <button
    type="button"
    className="entity-save-to-library-button"
    aria-label={label}
    title={label}
    disabled={disabled}
    data-cy={dataCy}
    onClick={event => {
      event.stopPropagation();
      onClick();
    }}
  >
    <FontAwesomeIcon icon="book" />
  </button>
);

export default EntitySaveToLibraryButton;
