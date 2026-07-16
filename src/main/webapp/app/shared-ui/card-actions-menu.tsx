import './card-actions-menu.scss';

import React from 'react';
import { Link } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translate } from 'react-jhipster';

export interface CardActionItem {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  to?: string;
  danger?: boolean;
  disabled?: boolean;
  'data-cy'?: string;
}

export interface CardActionsMenuProps {
  items: CardActionItem[];
  'data-cy'?: string;
}

export const CardActionsMenu = ({ items, 'data-cy': dataCy }: CardActionsMenuProps) => (
  <UncontrolledDropdown className="card-actions-menu" data-cy={dataCy}>
    <DropdownToggle
      color="link"
      className="card-actions-menu__toggle"
      aria-label={translate('processComposerApp.sharedUi.cardActionsMenu.label', 'More actions')}
      onClick={event => event.stopPropagation()}
    >
      <FontAwesomeIcon icon="ellipsis-v" />
    </DropdownToggle>
    <DropdownMenu end className="card-actions-menu__menu">
      {items.map(item =>
        item.to ? (
          <DropdownItem key={item.key} tag={Link} to={item.to} data-cy={item['data-cy']}>
            {item.label}
          </DropdownItem>
        ) : (
          <DropdownItem
            key={item.key}
            onClick={item.onClick}
            disabled={item.disabled}
            className={item.danger ? 'text-danger' : undefined}
            data-cy={item['data-cy']}
          >
            {item.label}
          </DropdownItem>
        )
      )}
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default CardActionsMenu;
