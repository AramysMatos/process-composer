import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import ProcessComposerLogoIcon from 'app/shared/icons/process-composer-logo-icon';
import { ProcessVisualizationNav } from 'app/modules/process-visualization/components/process-visualization-nav';
import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { DownloadStaticSiteButton } from 'app/modules/process-visualization/components/download-static-site-button';
import { processEditorPath } from 'app/modules/process-visualization/process-visualization-paths';

export interface ProcessVisualizationLayoutInnerProps {
  showEditorLink?: boolean;
}

export const ProcessVisualizationLayoutInner = ({ showEditorLink = true }: ProcessVisualizationLayoutInnerProps) => {
  const { loading, processMatches, processId, processName, basePath, source, error } = useProcessVisualization();
  const title = processName || translate('processComposerApp.processDesign.visualization.loadingProcess', 'Loading...');

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
        <Link to={source === 'yaml' ? '/visualizar-yaml/upload' : '/processos'}>
          <Translate
            contentKey={
              source === 'yaml'
                ? 'processComposerApp.processDesign.visualization.yaml.backToUpload'
                : 'processComposerApp.processDesign.visualization.backToProcesses'
            }
          >
            Back
          </Translate>
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
        <span className="process-visualization-site__process-title">{title}</span>
        <div className="process-visualization-site__header-actions d-flex flex-wrap gap-2">
          {showEditorLink && processId !== undefined && (
            <Button tag={Link} to={processEditorPath(processId)} color="primary" outline size="sm" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon="pencil-alt" className="me-1" />
              <Translate contentKey="processComposerApp.processDesign.visualization.openEditor">Open in editor</Translate>
            </Button>
          )}
          <DownloadStaticSiteButton source={source} processId={processId} />
        </div>
      </header>
      <div className="process-visualization-site__body">
        <ProcessVisualizationNav basePath={basePath} />
        <main className="process-visualization-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
