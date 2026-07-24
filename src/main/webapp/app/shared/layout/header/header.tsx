import './header.scss';

import React from 'react';
import { Translate } from 'react-jhipster';
import LoadingBar from 'react-redux-loading-bar';

export interface IHeaderProps {
  ribbonEnv: string;
  isInProduction: boolean;
}

/**
 * Topbar mínima: apenas a fita de ambiente (dev) e a loading bar.
 * A navegação principal e o menu de conta ficam na sidebar.
 */
const Header = (props: IHeaderProps) => {
  const renderDevRibbon = () =>
    props.isInProduction === false ? (
      <div className="ribbon dev">
        <a href="">
          <Translate contentKey={`global.ribbon.${props.ribbonEnv}`} />
        </a>
      </div>
    ) : null;

  return (
    <div id="app-header">
      {/* {renderDevRibbon()} */}
      <LoadingBar className="loading-bar" />
    </div>
  );
};

export default Header;
