import React from 'react';
import { Translate } from 'react-jhipster';
import { NavItem, NavLink } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const MainMenu = () => (
  <>
    <NavItem>
      <NavLink tag={Link} to="/processos" className="d-flex align-items-center" data-cy="menu-processes">
        <FontAwesomeIcon icon="project-diagram" />
        <span>
          <Translate contentKey="global.menu.processes">Processes</Translate>
        </span>
      </NavLink>
    </NavItem>
    <NavItem>
      <NavLink tag={Link} to="/biblioteca" className="d-flex align-items-center" data-cy="menu-library">
        <FontAwesomeIcon icon="book" />
        <span>
          <Translate contentKey="global.menu.library">Library</Translate>
        </span>
      </NavLink>
    </NavItem>
    <NavItem>
      <NavLink tag={Link} to="/projetos" className="d-flex align-items-center" data-cy="menu-projects">
        <FontAwesomeIcon icon="tasks" />
        <span>
          <Translate contentKey="global.menu.projects">Projects</Translate>
        </span>
      </NavLink>
    </NavItem>
  </>
);

export default MainMenu;
