import './yaml-preview.scss';

import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Translate, translate } from 'react-jhipster';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { getEntity as getProcess } from 'app/entities/process/process.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { Breadcrumb } from 'app/shared-ui/breadcrumb';
import { buildProcessYaml } from 'app/modules/process-export/build-process-yaml';
import { YamlSyntaxViewer } from 'app/modules/process-export/yaml-syntax-viewer';

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const slugifyFileName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'process';

const hydrateActivitiesWithArtifacts = (activities: IActivity[], artifacts: IArtifacts[]): IActivity[] => {
  const artifactById = new Map(artifacts.flatMap(artifact => (artifact.id !== undefined ? [[artifact.id, artifact] as const] : [])));

  const hydrateArtifactList = (items?: IArtifacts[] | null) =>
    (items ?? []).map(item => (item.id !== undefined ? artifactById.get(item.id) ?? item : item));

  return activities.map(activity => ({
    ...activity,
    requiredArtifacts: hydrateArtifactList(activity.requiredArtifacts),
    producedArtifacts: hydrateArtifactList(activity.producedArtifacts),
  }));
};

export const YamlPreview = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  const processId = Number(id);
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const processLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);

  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<IArtifacts[]>([]);
  const [artifactsError, setArtifactsError] = useState(false);

  useEffect(() => {
    if (!isValidProcessId) {
      return;
    }

    dispatch(getProcess(processId));
    dispatch(getPhaseEntities({}));
    dispatch(getActivityEntities({ eagerload: true }));
  }, [dispatch, isValidProcessId, processId]);

  useEffect(() => {
    if (!isValidProcessId) {
      return;
    }

    let cancelled = false;

    const loadArtifacts = async () => {
      setArtifactsLoading(true);
      setArtifactsError(false);

      try {
        const response = await axios.get<IArtifacts[]>(`api/artifacts?eagerload=true&cacheBuster=${Date.now()}`);
        if (!cancelled) {
          setArtifacts(response.data);
        }
      } catch {
        if (!cancelled) {
          setArtifacts([]);
          setArtifactsError(true);
        }
      } finally {
        if (!cancelled) {
          setArtifactsLoading(false);
        }
      }
    };

    loadArtifacts();

    return () => {
      cancelled = true;
    };
  }, [isValidProcessId, processId]);

  const phases = useMemo(
    () => (isValidProcessId ? sortById(phaseEntities.filter(phase => phase.process?.id === processId)) : []),
    [isValidProcessId, phaseEntities, processId]
  );

  const activities = useMemo(() => {
    const phaseIds = new Set(phases.map(phase => phase.id).filter((phaseId): phaseId is number => phaseId !== undefined));
    const filtered = activityEntities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id));
    return hydrateActivitiesWithArtifacts(filtered, artifacts);
  }, [activityEntities, artifacts, phases]);

  const yamlContent = useMemo(() => {
    if (!process.id || process.id !== processId) {
      return '';
    }

    return buildProcessYaml(process, phases, activities);
  }, [activities, phases, process, processId]);

  const loading = processLoading || phaseLoading || activityLoading || artifactsLoading;
  const processMatches = process.id === processId;
  const processName = process.processName ?? translate('processComposerApp.processDesign.overview.loadingProcess', 'Loading...');

  const handleDownload = useCallback(() => {
    if (!yamlContent) {
      return;
    }

    const fileName = `${slugifyFileName(process.processName ?? 'process')}.yaml`;
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [process.processName, yamlContent]);

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
      <header className="yaml-preview__header">
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
        <h1 className="h2 yaml-preview__title">
          <Translate contentKey="processComposerApp.processExport.title">Export YAML</Translate>
        </h1>
        <p className="text-muted mb-0">
          <Translate contentKey="processComposerApp.processExport.subtitle">
            Read-only preview of the process definition generated as YAML
          </Translate>
        </p>
      </header>

      {loading && (
        <div className="yaml-preview__loading">
          <Spinner color="primary" />
        </div>
      )}

      {!loading && !processMatches && (
        <Alert color="warning">
          <Translate contentKey="processComposerApp.processDesign.tree.processNotFound">Process not found</Translate>
        </Alert>
      )}

      {!loading && processMatches && (
        <>
          {artifactsError && (
            <Alert color="warning" className="mb-3">
              <Translate contentKey="processComposerApp.processExport.artifactsLoadWarning">
                Artifact templates could not be loaded. The YAML may be incomplete.
              </Translate>
            </Alert>
          )}

          <div className="yaml-preview__actions">
            <Button color="primary" onClick={handleDownload} disabled={!yamlContent} data-cy="yaml-download-button">
              <FontAwesomeIcon icon="download" className="me-2" />
              <Translate contentKey="processComposerApp.processExport.download">Download .yaml file</Translate>
            </Button>
          </div>

          <YamlSyntaxViewer value={yamlContent} />
        </>
      )}
    </div>
  );
};

export default YamlPreview;
