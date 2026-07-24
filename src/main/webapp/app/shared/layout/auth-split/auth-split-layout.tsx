import './auth-split.scss';

import React from 'react';

import AuthSplitHero from './auth-split-hero';

export type AuthSplitLayoutProps = {
  children: React.ReactNode;
};

export const AuthSplitLayout = ({ children }: AuthSplitLayoutProps) => (
  <div className="auth-split" id="auth-split-layout">
    <AuthSplitHero />
    {children}
  </div>
);

export default AuthSplitLayout;
