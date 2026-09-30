import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import ProcessYamlVisualizationLayout from 'app/modules/process-visualization/process-yaml-visualization-layout';
import YamlVisualizationUploadPage from 'app/modules/process-visualization/pages/yaml-visualization-upload';
import OverviewPage from 'app/modules/process-visualization/pages/overview-page';
import ActivitiesListPage from 'app/modules/process-visualization/pages/activities-list-page';
import ActivityVisualizationPage from 'app/modules/process-visualization/pages/activity-visualization-page';
import CatalogListPage from 'app/modules/process-visualization/pages/catalog-list-page';
import CatalogDetailPage from 'app/modules/process-visualization/pages/catalog-detail-page';
import CanvasPage from 'app/modules/process-visualization/pages/canvas-page';

const ProcessYamlVisualizationRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route path="upload" element={<YamlVisualizationUploadPage />} />
    <Route element={<ProcessYamlVisualizationLayout />}>
      <Route index element={<OverviewPage />} />
      <Route path="activities" element={<ActivitiesListPage />} />
      <Route path="activities/:activityRef" element={<ActivityVisualizationPage />} />
      <Route path="canvas" element={<CanvasPage />} />
      <Route path="roles" element={<CatalogListPage />} />
      <Route path="roles/:entityRef" element={<CatalogDetailPage />} />
      <Route path="tools" element={<CatalogListPage />} />
      <Route path="tools/:entityRef" element={<CatalogDetailPage />} />
      <Route path="guidelines" element={<CatalogListPage />} />
      <Route path="guidelines/:entityRef" element={<CatalogDetailPage />} />
      <Route path="artifacts" element={<CatalogListPage />} />
      <Route path="artifacts/:entityRef" element={<CatalogDetailPage />} />
      <Route path="templates" element={<CatalogListPage />} />
      <Route path="templates/:entityRef" element={<CatalogDetailPage />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ProcessYamlVisualizationRoutes;
