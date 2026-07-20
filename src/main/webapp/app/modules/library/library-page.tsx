import './library-page.scss';

import React, { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { LIBRARY_ENTITY_CONFIGS, LIBRARY_TAB_TYPES, isLibraryTabType } from 'app/modules/library/library.config';
import { LibraryMasterDetail } from 'app/modules/library/components/library-master-detail';
import { LibraryActivitiesMasterDetail } from 'app/modules/library/components/library-activities-master-detail';
import { LibraryPhasesMasterDetail } from 'app/modules/library/components/library-phases-master-detail';

const NEW_ITEM_ID = 'new';

export const LibraryPage = () => {
  const navigate = useNavigate();
  const { tipo, id } = useParams<'tipo' | 'id'>();

  const activeType = isLibraryTabType(tipo) ? tipo : 'roles';

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

  if (tipo && !isLibraryTabType(tipo)) {
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
        {LIBRARY_TAB_TYPES.map(entityType => (
          <NavItem key={entityType}>
            <NavLink
              className={activeType === entityType ? 'active' : ''}
              onClick={() => handleTabChange(entityType)}
              style={{ cursor: 'pointer' }}
              data-cy={`libraryTab-${entityType}`}
            >
              {entityType === 'activities' ? (
                <Translate contentKey="processComposerApp.library.tabs.activities">Activities</Translate>
              ) : entityType === 'phases' ? (
                <Translate contentKey="processComposerApp.library.tabs.phases">Phases</Translate>
              ) : (
                <Translate contentKey={LIBRARY_ENTITY_CONFIGS[entityType].tabLabelKey} />
              )}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {activeType === 'activities' ? (
        <LibraryActivitiesMasterDetail selectedId={id} onSelectItem={handleSelectItem} />
      ) : activeType === 'phases' ? (
        <LibraryPhasesMasterDetail selectedId={id} onSelectItem={handleSelectItem} />
      ) : (
        <LibraryMasterDetail key={activeType} config={LIBRARY_ENTITY_CONFIGS[activeType]} selectedId={id} onSelectItem={handleSelectItem} />
      )}
    </div>
  );
};

export default LibraryPage;
