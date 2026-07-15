import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Tools from './tools';
import ToolsDetail from './tools-detail';
import ToolsUpdate from './tools-update';
import ToolsDeleteDialog from './tools-delete-dialog';

const ToolsRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Tools />} />
    <Route path="new" element={<ToolsUpdate />} />
    <Route path=":id">
      <Route index element={<ToolsDetail />} />
      <Route path="edit" element={<ToolsUpdate />} />
      <Route path="delete" element={<ToolsDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ToolsRoutes;
