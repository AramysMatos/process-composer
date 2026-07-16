import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import ProcessList from './process-list';
import ProcessWizard from './process-wizard';
import ProcessOverview from './process-overview';
import ProcessCanvas from './process-canvas';
import YamlPreview from 'app/modules/process-export/yaml-preview';

export default () => {
  return (
    <ErrorBoundaryRoutes>
      <Route path="novo" element={<ProcessWizard />} />
      <Route path=":id/canvas" element={<ProcessCanvas />} />
      <Route path=":id/exportar" element={<YamlPreview />} />
      <Route path=":id" element={<ProcessOverview />} />
      <Route index element={<ProcessList />} />
    </ErrorBoundaryRoutes>
  );
};
