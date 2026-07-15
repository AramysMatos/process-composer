import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Templates from './templates';
import TemplatesDetail from './templates-detail';
import TemplatesUpdate from './templates-update';
import TemplatesDeleteDialog from './templates-delete-dialog';

const TemplatesRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Templates />} />
    <Route path="new" element={<TemplatesUpdate />} />
    <Route path=":id">
      <Route index element={<TemplatesDetail />} />
      <Route path="edit" element={<TemplatesUpdate />} />
      <Route path="delete" element={<TemplatesDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default TemplatesRoutes;
