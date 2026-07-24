import './app-sidebar-nav.scss';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Storage, Translate, translate } from 'react-jhipster';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import ProcessComposerLogoIcon from 'app/shared/icons/process-composer-logo-icon';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FolderKanban,
  Gauge,
  GitBranch,
  HeartPulse,
  Home,
  Languages,
  Lock,
  LogIn,
  LogOut,
  ScrollText,
  Settings,
  Settings2,
  UserPlus,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { setLocale } from 'app/shared/reducers/locale';
import { locales, languages } from 'app/config/translation';

const SIDEBAR_COLLAPSED_KEY = 'app-sidebar-collapsed';

export interface IAppSidebarNavProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOpenAPIEnabled: boolean;
  currentLocale: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

interface NavItemConfig {
  to: string;
  labelKey: string;
  defaultLabel: string;
  icon: LucideIcon;
  dataCy: string;
  end?: boolean;
}

const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { to: '/', labelKey: 'global.menu.home', defaultLabel: 'Início', icon: Home, dataCy: 'menu-home', end: true },
  { to: '/processos', labelKey: 'global.menu.processes', defaultLabel: 'Processos', icon: GitBranch, dataCy: 'menu-processes' },
  { to: '/biblioteca', labelKey: 'global.menu.library', defaultLabel: 'Biblioteca', icon: BookOpen, dataCy: 'menu-library' },
  { to: '/projetos', labelKey: 'global.menu.projects', defaultLabel: 'Projetos', icon: FolderKanban, dataCy: 'menu-projects' },
];

const isPathActive = (pathname: string, itemPath: string, end?: boolean) => {
  if (end || itemPath === '/') {
    return pathname === '/' || pathname === '';
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
};

const getDisplayName = (account: { firstName?: string; lastName?: string; login?: string }) => {
  const fullName = [account.firstName, account.lastName].filter(Boolean).join(' ').trim();
  return fullName || account.login || translate('global.menu.account.main');
};

const getInitials = (account: { firstName?: string; lastName?: string; login?: string }) => {
  if (account.firstName || account.lastName) {
    return `${account.firstName?.[0] ?? ''}${account.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }
  return (account.login?.[0] ?? '?').toUpperCase();
};

export const AppSidebarNav = ({
  isAuthenticated,
  isAdmin,
  isOpenAPIEnabled,
  currentLocale,
  collapsed,
  onCollapsedChange,
}: IAppSidebarNavProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.authentication.account);

  const displayName = useMemo(() => getDisplayName(account ?? {}), [account]);
  const initials = useMemo(() => getInitials(account ?? {}), [account]);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [adminExpanded, setAdminExpanded] = useState(isAdminRoute);

  useEffect(() => {
    if (isAdminRoute) {
      setAdminExpanded(true);
    }
  }, [isAdminRoute]);

  const handleLocaleChange = (langKey: string) => {
    Storage.session.set('locale', langKey);
    dispatch(setLocale(langKey));
  };

  const toggleCollapsed = () => {
    onCollapsedChange(!collapsed);
  };

  const toggleAdminSection = () => {
    if (collapsed) {
      onCollapsedChange(false);
      setAdminExpanded(true);
      return;
    }
    setAdminExpanded(current => !current);
  };

  const adminItems = [
    {
      to: '/admin/user-management',
      icon: Users,
      labelKey: 'global.menu.admin.userManagement',
      defaultLabel: 'User management',
    },
    {
      to: '/admin/metrics',
      icon: Gauge,
      labelKey: 'global.menu.admin.metrics',
      defaultLabel: 'Metrics',
    },
    {
      to: '/admin/health',
      icon: HeartPulse,
      labelKey: 'global.menu.admin.health',
      defaultLabel: 'Health',
    },
    {
      to: '/admin/configuration',
      icon: Settings,
      labelKey: 'global.menu.admin.configuration',
      defaultLabel: 'Configuration',
    },
    {
      to: '/admin/logs',
      icon: ScrollText,
      labelKey: 'global.menu.admin.logs',
      defaultLabel: 'Logs',
    },
  ];

  if (isOpenAPIEnabled) {
    adminItems.push({
      to: '/admin/docs',
      icon: FileCode,
      labelKey: 'global.menu.admin.apidocs',
      defaultLabel: 'API',
    });
  }

  return (
    <aside
      className={`app-sidebar${collapsed ? ' app-sidebar--collapsed' : ''}`}
      data-cy="app-sidebar"
      aria-label={translate('global.title')}
    >
      <RouterNavLink to="/" className="app-sidebar__brand" title={translate('global.title')}>
        <span className="app-sidebar__brand-mark" aria-hidden>
          <ProcessComposerLogoIcon className="app-sidebar__brand-logo" />
        </span>
        <span className="app-sidebar__brand-text">
          <Translate contentKey="global.title">Process Composer</Translate>
        </span>
      </RouterNavLink>

      <nav className="app-sidebar__nav" aria-label="Principal">
        {MAIN_NAV_ITEMS.filter(item => item.to === '/' || isAuthenticated).map(item => {
          const Icon = item.icon;
          const active = isPathActive(location.pathname, item.to, item.end);
          const label = translate(item.labelKey, item.defaultLabel);
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`app-sidebar__link${active ? ' app-sidebar__link--active' : ''}`}
              data-cy={item.dataCy}
              title={collapsed ? label : undefined}
            >
              <Icon className="app-sidebar__icon" aria-hidden />
              <span className="app-sidebar__label">{label}</span>
            </RouterNavLink>
          );
        })}
      </nav>

      <div className="app-sidebar__spacer" />

      {isAuthenticated && isAdmin && (
        <div className="app-sidebar__secondary" data-cy="adminMenu">
          <div className="app-sidebar__admin-group">
            <button
              type="button"
              className={`app-sidebar__admin-toggle${adminExpanded ? ' app-sidebar__admin-toggle--expanded' : ''}`}
              onClick={toggleAdminSection}
              aria-expanded={adminExpanded}
              title={collapsed ? translate('global.menu.advanced.main') : undefined}
            >
              <Settings2 className="app-sidebar__icon" aria-hidden />
              <span className="app-sidebar__label">
                <Translate contentKey="global.menu.advanced.main">Administração/Avançado</Translate>
              </span>
              <ChevronDown className="app-sidebar__admin-chevron" aria-hidden />
            </button>
            {adminExpanded && !collapsed && (
              <div className="app-sidebar__admin-submenu">
                {adminItems.map(item => {
                  const Icon = item.icon;
                  const active = isPathActive(location.pathname, item.to);
                  return (
                    <Link key={item.to} to={item.to} className={`app-sidebar__sublink${active ? ' app-sidebar__sublink--active' : ''}`}>
                      <Icon className="app-sidebar__icon" aria-hidden />
                      <span className="app-sidebar__label">
                        <Translate contentKey={item.labelKey}>{item.defaultLabel}</Translate>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="app-sidebar__account">
        <UncontrolledDropdown direction="up" className="app-sidebar__dropdown" data-cy="accountMenu">
          <DropdownToggle
            tag="button"
            type="button"
            caret={false}
            className="app-sidebar__account-trigger"
            title={collapsed ? displayName : undefined}
          >
            <span className="app-sidebar__avatar" aria-hidden>
              {account?.imageUrl ? <img src={account.imageUrl} alt="" /> : initials}
            </span>
            <span className="app-sidebar__account-name">{displayName}</span>
          </DropdownToggle>
          <DropdownMenu container="body" className="app-sidebar__dropdown-menu">
            {isAuthenticated ? (
              <>
                <DropdownItem tag={Link} to="/account/settings" data-cy="settings">
                  <Settings aria-hidden />
                  <Translate contentKey="global.menu.account.settings">Settings</Translate>
                </DropdownItem>
                <DropdownItem tag={Link} to="/account/password" data-cy="passwordItem">
                  <Lock aria-hidden />
                  <Translate contentKey="global.menu.account.password">Password</Translate>
                </DropdownItem>
                {Object.keys(languages).length > 1 && (
                  <>
                    <DropdownItem header>
                      <Translate contentKey="global.menu.language">Language</Translate>
                    </DropdownItem>
                    {locales.map(locale => (
                      <DropdownItem
                        key={`account-locale-${locale}`}
                        active={locale === currentLocale}
                        onClick={() => handleLocaleChange(locale)}
                      >
                        <Languages aria-hidden />
                        {languages[locale].name}
                      </DropdownItem>
                    ))}
                  </>
                )}
                <DropdownItem divider />
                <DropdownItem tag={Link} to="/logout" data-cy="logout">
                  <LogOut aria-hidden />
                  <Translate contentKey="global.menu.account.logout">Sign out</Translate>
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem tag={Link} to="/login" data-cy="login" id="login-item">
                  <LogIn aria-hidden />
                  <Translate contentKey="global.menu.account.login">Sign in</Translate>
                </DropdownItem>
                <DropdownItem tag={Link} to="/account/register" data-cy="register">
                  <UserPlus aria-hidden />
                  <Translate contentKey="global.menu.account.register">Register</Translate>
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>

      <div className="app-sidebar__footer">
        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={toggleCollapsed}
          data-cy="sidebar-toggle"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="app-sidebar__icon" aria-hidden />
          ) : (
            <ChevronLeft className="app-sidebar__icon" aria-hidden />
          )}
          <span className="app-sidebar__label">{collapsed ? 'Expandir' : 'Recolher'}</span>
        </button>
      </div>
    </aside>
  );
};

export const useSidebarCollapsed = () => {
  const [collapsed, setCollapsed] = useState(() => Storage.local.get(SIDEBAR_COLLAPSED_KEY) === true);

  useEffect(() => {
    Storage.local.set(SIDEBAR_COLLAPSED_KEY, collapsed);
  }, [collapsed]);

  return [collapsed, setCollapsed] as const;
};

export default AppSidebarNav;
