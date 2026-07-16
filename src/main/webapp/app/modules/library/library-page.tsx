import './library-page.scss';

import React, { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { LIBRARY_ENTITY_CONFIGS, LIBRARY_ENTITY_TYPES, isLibraryEntityType } from 'app/modules/library/library.config';
import { LibraryMasterDetail } from 'app/modules/library/components/library-master-detail';

const NEW_ITEM_ID = 'new';

export const LibraryPage = () => {
  const navigate = useNavigate();
  const { tipo, id } = useParams<'tipo' | 'id'>();

  const activeType = isLibraryEntityType(tipo) ? tipo : 'roles';
  const config = LIBRARY_ENTITY_CONFIGS[activeType];

  const handleTabChange = (nextType: typeof activeType) => {
    navigate(`/biblioteca/${nextType}`);
  };

  const handleSelectItem = useCallback(
    (itemId: number | typeof NEW_ITEM_ID | undefined) => {
      if (itemId === undefined) {
        navigate(`/biblioteca/${activeType}`);
        return;
      }

      navigate(`/biblioteca/${activeType}/${itemId}`);
    },
    [activeType, navigate]
  );

  if (tipo && !isLibraryEntityType(tipo)) {
    return <Navigate to="/biblioteca/roles" replace />;
  }

  if (!tipo) {
    return <Navigate to="/biblioteca/roles" replace />;
  }

  return (
    <div className="library-page" data-cy="libraryPage">
      <header className="library-page__header">
        <div>
          <h1 className="h2 mb-1">
            <Translate contentKey="processComposerApp.library.title">Library</Translate>
          </h1>
          <p className="text-muted mb-0">
            <Translate contentKey="processComposerApp.library.subtitle">
              Manage reusable catalog items and see where they are used
            </Translate>
          </p>
        </div>
      </header>

      <Nav tabs className="library-page__tabs mb-4">
        {LIBRARY_ENTITY_TYPES.map(entityType => (
          <NavItem key={entityType}>
            <NavLink
              className={activeType === entityType ? 'active' : ''}
              onClick={() => handleTabChange(entityType)}
              style={{ cursor: 'pointer' }}
              data-cy={`libraryTab-${entityType}`}
            >
              <Translate contentKey={LIBRARY_ENTITY_CONFIGS[entityType].tabLabelKey} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <LibraryMasterDetail key={activeType} config={config} selectedId={id} onSelectItem={handleSelectItem} />
    </div>
  );
};

export default LibraryPage;
