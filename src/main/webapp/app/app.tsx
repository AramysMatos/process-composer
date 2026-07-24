import React, { useEffect } from 'react';
import { Card } from 'reactstrap';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'app/config/dayjs.ts';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import { getProfile } from 'app/shared/reducers/application-profile';
import Header from 'app/shared/layout/header/header';
import AppSidebarNav, { useSidebarCollapsed } from 'app/shared/layout/app-sidebar-nav';
import { isAuthPublicRoute } from 'app/shared/layout/auth-split/auth-public-routes';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import ErrorBoundary from 'app/shared/error/error-boundary';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');

const AppLayout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed();
  const authPublicPage = isAuthPublicRoute(location.pathname);

  useEffect(() => {
    dispatch(getSession());
    dispatch(getProfile());
  }, [dispatch]);

  const currentLocale = useAppSelector(state => state.locale.currentLocale);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [AUTHORITIES.ADMIN]));
  const ribbonEnv = useAppSelector(state => state.applicationProfile.ribbonEnv);
  const isInProduction = useAppSelector(state => state.applicationProfile.inProduction);
  const isOpenAPIEnabled = useAppSelector(state => state.applicationProfile.isOpenAPIEnabled);

  if (authPublicPage) {
    return (
      <>
        <ToastContainer position={toast.POSITION.TOP_LEFT} className="toastify-container" toastClassName="toastify-toast" />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </>
    );
  }

  return (
    <div className={`app-shell${sidebarCollapsed ? ' app-shell--sidebar-collapsed' : ''}`}>
      <ErrorBoundary>
        <AppSidebarNav
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          isOpenAPIEnabled={isOpenAPIEnabled}
          currentLocale={currentLocale}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </ErrorBoundary>
      <div className="app-shell__main">
        <div className="app-container">
          <ToastContainer position={toast.POSITION.TOP_LEFT} className="toastify-container" toastClassName="toastify-toast" />
          <ErrorBoundary>
            <Header ribbonEnv={ribbonEnv} isInProduction={isInProduction} />
          </ErrorBoundary>
          <div className="container-fluid view-container" id="app-view-container">
            <Card className="jh-card">
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export const App = () => (
  <BrowserRouter basename={baseHref}>
    <AppLayout />
  </BrowserRouter>
);

export default App;
