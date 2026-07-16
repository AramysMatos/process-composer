import React from 'react';
import { translate } from 'react-jhipster';
import { NavDropdown } from './menu-components';
import EntitiesMenuItems from 'app/entities/menu';

export const AdvancedEntitiesMenu = () => (
  <NavDropdown
    icon="cogs"
    name={translate('global.menu.advanced.main')}
    id="advanced-menu"
    data-cy="advanced-menu"
    style={{ maxHeight: '80vh', overflow: 'auto' }}
  >
    <EntitiesMenuItems />
  </NavDropdown>
);
