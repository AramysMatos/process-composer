import React from 'react';

export type AuthSplitPanelProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  titleId?: string;
  titleDataCy?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

export const AuthSplitPanel = ({ title, subtitle, titleId, titleDataCy, children, footer, wide }: AuthSplitPanelProps) => (
  <div className="auth-split__panel">
    <div className={`auth-split__card${wide ? ' auth-split__card--wide' : ''}`}>
      <h1 id={titleId} className="auth-split__panel-title" data-cy={titleDataCy}>
        {title}
      </h1>
      {subtitle ? <p className="auth-split__panel-sub text-muted">{subtitle}</p> : null}
      {children}
      {footer ? <p className="auth-split__footer text-muted">{footer}</p> : null}
    </div>
  </div>
);

export default AuthSplitPanel;
