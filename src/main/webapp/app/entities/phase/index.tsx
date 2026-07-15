import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Phase from './phase';
import PhaseDetail from './phase-detail';
import PhaseUpdate from './phase-update';
import PhaseDeleteDialog from './phase-delete-dialog';

const PhaseRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Phase />} />
    <Route path="new" element={<PhaseUpdate />} />
    <Route path=":id">
      <Route index element={<PhaseDetail />} />
      <Route path="edit" element={<PhaseUpdate />} />
      <Route path="delete" element={<PhaseDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default PhaseRoutes;
