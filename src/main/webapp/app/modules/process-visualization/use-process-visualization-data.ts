import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { getEntity as getProcessEntity } from 'app/entities/process/process.reducer';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import {
  buildUnifiedFromApiStores,
  ProcessVisualizationUnifiedData,
} from 'app/modules/process-visualization/process-visualization-unified.model';

export function useProcessVisualizationData(processId: number): ProcessVisualizationUnifiedData {
  const dispatch = useAppDispatch();
  const isValidProcessId = Number.isFinite(processId) && processId > 0;

  const process = useAppSelector(state => state.process.entity);
  const processLoading = useAppSelector(state => state.process.loading);
  const phaseEntities = useAppSelector(state => state.phase.entities);
  const phaseLoading = useAppSelector(state => state.phase.loading);
  const activityEntities = useAppSelector(state => state.activity.entities);
  const activityLoading = useAppSelector(state => state.activity.loading);
  const processError = useAppSelector(state => state.process.errorMessage);

  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<IArtifacts[]>([]);
  const [artifactsError, setArtifactsError] = useState(false);

  useEffect(() => {
    if (!isValidProcessId) {
      return;
    }
    dispatch(getProcessEntity(processId));
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

  const loading = processLoading || phaseLoading || activityLoading || artifactsLoading;
  const processMatches = process.id === processId;

  return useMemo(
    () =>
      buildUnifiedFromApiStores(
        processId,
        process,
        phaseEntities,
        activityEntities,
        artifacts,
        loading,
        processMatches,
        artifactsError,
        Boolean(processError) && !processLoading
      ),
    [activityEntities, artifacts, artifactsError, loading, phaseEntities, process, processError, processId, processLoading, processMatches]
  );
}
