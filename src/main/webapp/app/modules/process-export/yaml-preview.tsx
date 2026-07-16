import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity as getProcess } from 'app/entities/process/process.reducer';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';

export const YamlPreview = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const processId = Number(id);
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const processLoading = useAppSelector(state => state.process.loading);

  useEffect(() => {
    if (!isValidProcessId) {
      return;
    }

    dispatch(getProcess(processId));
  }, [dispatch, isValidProcessId, processId]);

  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.overview.loadingProcess', 'Loading...');

  if (!isValidProcessId) {
    return (
      <div className="yaml-preview" data-cy="yaml-preview">
        <Alert color="danger">
          <Translate contentKey="processComposerApp.processDesign.overview.invalidProcessId">Invalid process id</Translate>
        </Alert>
      </div>
    );
  }

  return (
    <div className="yaml-preview" data-cy="yaml-preview">
      <header className="mb-3">
        <Breadcrumb
          items={[
            {
              label: translate('processComposerApp.processDesign.overview.breadcrumbProcesses', 'Processes'),
              path: '/processos',
            },
            {
              label: processMatches ? processName : translate('processComposerApp.processDesign.overview.loadingProcess', 'Loading...'),
              path: `/processos/${processId}`,
            },
            { label: translate('processComposerApp.processExport.title', 'Export YAML') },
          ]}
          data-cy="yaml-preview-breadcrumb"
        />
      </header>

      {processLoading && (
        <div className="text-center py-4">
          <Spinner color="primary" />
        </div>
      )}

      {!processLoading && processMatches && (
        <Alert color="info">
          <Translate contentKey="processComposerApp.processExport.placeholder">
            YAML export preview — generated process definition will appear here.
          </Translate>
        </Alert>
      )}
    </div>
  );
};

export default YamlPreview;
