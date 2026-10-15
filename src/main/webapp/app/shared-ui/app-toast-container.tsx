import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

import './app-toast.scss';

export const AppToastContainer = () => (
  <ToastContainer
    position={toast.POSITION.BOTTOM_RIGHT}
    theme="light"
    className="toastify-container"
    toastClassName="toastify-toast"
    hideProgressBar
    limit={4}
    autoClose={5000}
    pauseOnHover
    closeOnClick
    draggable
  />
);

export default AppToastContainer;
