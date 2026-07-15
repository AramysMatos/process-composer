import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Guidelines from './guidelines';
import GuidelinesDetail from './guidelines-detail';
import GuidelinesUpdate from './guidelines-update';
import GuidelinesDeleteDialog from './guidelines-delete-dialog';

const GuidelinesRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Guidelines />} />
    <Route path="new" element={<GuidelinesUpdate />} />
    <Route path=":id">
      <Route index element={<GuidelinesDetail />} />
      <Route path="edit" element={<GuidelinesUpdate />} />
      <Route path="delete" element={<GuidelinesDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default GuidelinesRoutes;
