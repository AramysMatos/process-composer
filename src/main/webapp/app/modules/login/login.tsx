import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { login } from 'app/shared/reducers/authentication';
import LoginPage from './login-page';

export const Login = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const loginError = useAppSelector(state => state.authentication.loginError);
  const loading = useAppSelector(state => state.authentication.loading);
  const location = useLocation();

  const handleLogin = (username: string, password: string, rememberMe = false) => dispatch(login(username, password, rememberMe));

  const { from } = (location.state as { from?: { pathname: string; search?: string } }) || {
    from: { pathname: '/', search: location.search },
  };
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  return <LoginPage handleLogin={handleLogin} loginError={loginError} loading={loading} />;
};

export default Login;
