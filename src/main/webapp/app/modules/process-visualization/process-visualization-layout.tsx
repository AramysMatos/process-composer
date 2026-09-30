import './process-visualization.scss';

import React from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import ProcessComposerLogoIcon from 'app/shared/icons/process-composer-logo-icon';
import { ProcessVisualizationNav } from 'app/modules/process-visualization/components/process-visualization-nav';
import { ProcessVisualizationProvider, useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { processEditorPath } from 'app/modules/process-visualization/process-visualization-paths';

const ProcessVisualizationLayoutInner = () => {
  const { loading, process, processMatches, processId, error } = useProcessVisualization();
  const processName = process.processName ?? translate('processComposerApp.processDesign.visualization.loadingProcess', 'Loading...');

  if (loading && !processMatches) {
    return (
      <div className="process-visualization-site d-flex justify-content-center align-items-center p-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error || (!loading && !processMatches)) {
    return (
      <div className="process-visualization-site p-4">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.processDesign.visualization.processNotFound">
            Process not found or access denied.
          </Translate>
        </Alert>
        <Link to="/processos">
          <Translate contentKey="processComposerApp.processDesign.visualization.backToProcesses">Back to processes</Translate>
        </Link>
      </div>
    );
  }

  return (
    <div className="process-visualization-site">
      <header className="process-visualization-site__header">
        <Link to="/" className="process-visualization-site__brand">
          <ProcessComposerLogoIcon width={28} height={28} />
          <span>ModusComposer</span>
        </Link>
        <span className="process-visualization-site__process-title">{processName}</span>
        <div className="process-visualization-site__header-actions">
          <Button tag={Link} to={processEditorPath(processId)} color="primary" outline size="sm" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon="pencil-alt" className="me-1" />
            <Translate contentKey="processComposerApp.processDesign.visualization.openEditor">Open in editor</Translate>
          </Button>
        </div>
      </header>
      <div className="process-visualization-site__body">
        <ProcessVisualizationNav processId={processId} />
        <main className="process-visualization-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

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
      <ProcessVisualizationLayoutInner />
    </ProcessVisualizationProvider>
  );
};

export default ProcessVisualizationLayout;
