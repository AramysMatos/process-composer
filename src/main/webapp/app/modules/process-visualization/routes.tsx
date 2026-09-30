import React from 'react';
import { Route } from 'react-router-dom';

import ProcessVisualizationLayout from 'app/modules/process-visualization/process-visualization-layout';
import OverviewPage from 'app/modules/process-visualization/pages/overview-page';
import ActivitiesListPage from 'app/modules/process-visualization/pages/activities-list-page';
import ActivityVisualizationPage from 'app/modules/process-visualization/pages/activity-visualization-page';
import CatalogListPage from 'app/modules/process-visualization/pages/catalog-list-page';
import CatalogDetailPage from 'app/modules/process-visualization/pages/catalog-detail-page';
import CanvasPage from 'app/modules/process-visualization/pages/canvas-page';

/** Nested routes — register under process-design ErrorBoundaryRoutes. */
export const processVisualizationRouteElements = (
  <>
    <Route path=":id/visualizar" element={<ProcessVisualizationLayout />}>
      <Route index element={<OverviewPage />} />
      <Route path="activities" element={<ActivitiesListPage />} />
      <Route path="activities/:activityId" element={<ActivityVisualizationPage />} />
      <Route path="canvas" element={<CanvasPage />} />
      <Route path="roles" element={<CatalogListPage />} />
      <Route path="roles/:entityId" element={<CatalogDetailPage />} />
      <Route path="tools" element={<CatalogListPage />} />
      <Route path="tools/:entityId" element={<CatalogDetailPage />} />
      <Route path="guidelines" element={<CatalogListPage />} />
      <Route path="guidelines/:entityId" element={<CatalogDetailPage />} />
      <Route path="artifacts" element={<CatalogListPage />} />
      <Route path="artifacts/:entityId" element={<CatalogDetailPage />} />
      <Route path="templates" element={<CatalogListPage />} />
      <Route path="templates/:entityId" element={<CatalogDetailPage />} />
    </Route>
  </>
);

export default processVisualizationRouteElements;
