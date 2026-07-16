import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import LibraryPage from './library-page';

export default () => {
  return (
    <ErrorBoundaryRoutes>
      <Route path=":tipo/:id" element={<LibraryPage />} />
      <Route path=":tipo" element={<LibraryPage />} />
      <Route index element={<LibraryPage />} />
    </ErrorBoundaryRoutes>
  );
};
