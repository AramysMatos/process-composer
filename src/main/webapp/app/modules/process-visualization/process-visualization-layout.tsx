import './process-visualization.scss';

import React from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { ProcessVisualizationProvider } from 'app/modules/process-visualization/process-visualization-context';
import { ProcessVisualizationLayoutInner } from 'app/modules/process-visualization/process-visualization-layout-inner';

export const ProcessVisualizationLayout = () => {
  const { id } = useParams<'id'>();
  const processId = Number(id);

  if (!Number.isFinite(processId) || processId <= 0) {
    return (
      <Alert color="warning" className="m-3">
        <Translate contentKey="processComposerApp.processDesign.visualization.invalidProcess">Invalid process.</Translate>
      </Alert>
    );
  }

  return (
    <ProcessVisualizationProvider processId={processId}>
      <ProcessVisualizationLayoutInner showEditorLink />
    </ProcessVisualizationProvider>
  );
};

export default ProcessVisualizationLayout;
