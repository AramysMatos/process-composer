import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';
import { getEntity as getProcessEntity } from 'app/entities/process/process.reducer';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IProcess } from 'app/shared/model/process.model';
import {
  buildProcessVisualizationIndexes,
  ProcessVisualizationIndexes,
} from 'app/modules/process-visualization/process-visualization-indexes';
import {
  filterActivitiesForPhases,
  filterPhasesForProcess,
  groupActivitiesByPhaseId,
  hydrateActivitiesWithArtifacts,
} from 'app/modules/process-visualization/process-visualization-data.utils';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';

export interface ProcessVisualizationData {
  processId: number;
  process: IProcess;
  phases: IPhase[];
  activities: IActivity[];
  activitiesByPhaseId: Map<number, IActivity[]>;
  indexes: ProcessVisualizationIndexes;
  loading: boolean;
  processMatches: boolean;
  artifactsError: boolean;
  error: boolean;
}

export function useProcessVisualizationData(processId: number): ProcessVisualizationData {
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

  const phases = useMemo(
    () => (isValidProcessId ? filterPhasesForProcess(processId, phaseEntities) : []),
    [isValidProcessId, phaseEntities, processId]
  );

  const activities = useMemo(() => {
    if (!isValidProcessId) {
      return [];
    }
    const filtered = filterActivitiesForPhases(phases, activityEntities);
    return hydrateActivitiesWithArtifacts(filtered, artifacts);
  }, [activityEntities, artifacts, isValidProcessId, phases]);

  const activitiesByPhaseId = useMemo(() => groupActivitiesByPhaseId(phases, activities), [activities, phases]);

  const indexes = useMemo(() => buildProcessVisualizationIndexes(activities), [activities]);

  const loading = processLoading || phaseLoading || activityLoading || artifactsLoading;
  const processMatches = process.id === processId;

  return {
    processId,
    process,
    phases,
    activities,
    activitiesByPhaseId,
    indexes,
    loading,
    processMatches,
    artifactsError,
    error: Boolean(processError) && !processLoading,
  };
}
