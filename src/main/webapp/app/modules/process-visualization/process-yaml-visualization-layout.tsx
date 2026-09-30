import './process-visualization.scss';

import React from 'react';
import { Navigate } from 'react-router-dom';

import { ProcessYamlVisualizationProvider } from 'app/modules/process-visualization/process-visualization-context';
import { ProcessVisualizationLayoutInner } from 'app/modules/process-visualization/process-visualization-layout-inner';
import { loadYamlSnapshotFromSession } from 'app/modules/process-visualization/process-visualization-yaml-storage';

export const ProcessYamlVisualizationLayout = () => {
  const snapshot = loadYamlSnapshotFromSession();
  if (!snapshot) {
    return <Navigate to="/visualizar-yaml/upload" replace />;
  }

  return (
    <ProcessYamlVisualizationProvider snapshot={snapshot}>
      <ProcessVisualizationLayoutInner showEditorLink={false} />
    </ProcessYamlVisualizationProvider>
  );
};

export default ProcessYamlVisualizationLayout;
