import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Artifacts from './artifacts';
import ArtifactsDetail from './artifacts-detail';
import ArtifactsUpdate from './artifacts-update';
import ArtifactsDeleteDialog from './artifacts-delete-dialog';

const ArtifactsRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Artifacts />} />
    <Route path="new" element={<ArtifactsUpdate />} />
    <Route path=":id">
      <Route index element={<ArtifactsDetail />} />
      <Route path="edit" element={<ArtifactsUpdate />} />
      <Route path="delete" element={<ArtifactsDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ArtifactsRoutes;
