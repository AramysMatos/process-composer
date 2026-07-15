import React from 'react';
import { Translate } from 'react-jhipster';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/tools">
        <Translate contentKey="global.menu.entities.tools" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/guidelines">
        <Translate contentKey="global.menu.entities.guidelines" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/roles">
        <Translate contentKey="global.menu.entities.roles" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/artifacts">
        <Translate contentKey="global.menu.entities.artifacts" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/templates">
        <Translate contentKey="global.menu.entities.templates" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/process">
        <Translate contentKey="global.menu.entities.process" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/phase">
        <Translate contentKey="global.menu.entities.phase" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/project">
        <Translate contentKey="global.menu.entities.project" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/task">
        <Translate contentKey="global.menu.entities.task" />
      </MenuItem>
      <MenuItem icon="asterisk" to="/activity">
        <Translate contentKey="global.menu.entities.activity" />
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
