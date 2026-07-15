import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Roles from './roles';
import RolesDetail from './roles-detail';
import RolesUpdate from './roles-update';
import RolesDeleteDialog from './roles-delete-dialog';

const RolesRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Roles />} />
    <Route path="new" element={<RolesUpdate />} />
    <Route path=":id">
      <Route index element={<RolesDetail />} />
      <Route path="edit" element={<RolesUpdate />} />
      <Route path="delete" element={<RolesDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default RolesRoutes;
