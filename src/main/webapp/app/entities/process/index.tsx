import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Process from './process';
import ProcessDetail from './process-detail';
import ProcessUpdate from './process-update';
import ProcessDeleteDialog from './process-delete-dialog';

const ProcessRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Process />} />
    <Route path="new" element={<ProcessUpdate />} />
    <Route path=":id">
      <Route index element={<ProcessDetail />} />
      <Route path="edit" element={<ProcessUpdate />} />
      <Route path="delete" element={<ProcessDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ProcessRoutes;
