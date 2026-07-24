import React, { useLayoutEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { logout } from 'app/shared/reducers/authentication';

export const Logout = () => {
  const logoutUrl = useAppSelector(state => state.authentication.logoutUrl);
  const dispatch = useAppDispatch();
  const [goToLogin, setGoToLogin] = useState(false);

  useLayoutEffect(() => {
    dispatch(logout());
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      setGoToLogin(true);
    }
  }, [dispatch, logoutUrl]);

  if (goToLogin) {
    return <Navigate to="/login" replace />;
  }

  return null;
};

export default Logout;
