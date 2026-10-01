import React, { useCallback, useState } from 'react';
import { Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate } from 'react-jhipster';

import {
  downloadStaticSiteForProcessId,
  downloadStaticSiteFromSnapshot,
} from 'app/modules/process-visualization/download-static-site-for-process';
import { loadYamlSnapshotFromSession } from 'app/modules/process-visualization/process-visualization-yaml-storage';
import { VisualizationSource } from 'app/modules/process-visualization/process-visualization-unified.model';

export const DownloadStaticSiteButton = ({ source, processId }: { source: VisualizationSource; processId?: number }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      if (source === 'yaml') {
        const snapshot = loadYamlSnapshotFromSession();
        if (snapshot) {
          await downloadStaticSiteFromSnapshot(snapshot);
        }
        return;
      }
      if (processId !== undefined) {
        await downloadStaticSiteForProcessId(processId);
      }
    } finally {
      setLoading(false);
    }
  }, [processId, source]);

  return (
    <Button color="secondary" outline size="sm" onClick={() => void handleClick()} disabled={loading} data-cy="download-static-site-button">
      {loading ? <Spinner size="sm" className="me-1" /> : <FontAwesomeIcon icon="box" className="me-1" />}
      <Translate contentKey="processComposerApp.processDesign.visualization.yaml.downloadStaticSite">Download static site (ZIP)</Translate>
    </Button>
  );
};
