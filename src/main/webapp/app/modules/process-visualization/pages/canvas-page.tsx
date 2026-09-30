import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Translate } from 'react-jhipster';

import { ActivityCanvas } from 'app/modules/process-design/components/activity-canvas';
import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { processVisualizationActivityPath } from 'app/modules/process-visualization/process-visualization-paths';

export const CanvasPage = () => {
  const { processId } = useProcessVisualization();
  const navigate = useNavigate();

  return (
    <div className="process-visualization-canvas-page" data-cy="visualization-canvas">
      <div className="process-visualization-canvas-page__header">
        <h1 className="h5 mb-0">
          <Translate contentKey="processComposerApp.processDesign.visualization.nav.canvas">Canvas</Translate>
        </h1>
        <p className="text-muted small mb-0">
          <Translate contentKey="processComposerApp.processDesign.visualization.canvasHint">Click an activity to open its sheet.</Translate>
        </p>
      </div>
      <div className="process-visualization-canvas-page__canvas-area">
        <ActivityCanvas
          processId={processId}
          readOnly
          onSelectActivity={activityId => navigate(processVisualizationActivityPath(processId, activityId))}
        />
      </div>
    </div>
  );
};

export default CanvasPage;
