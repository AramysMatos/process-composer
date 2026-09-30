import React, { createContext, useContext, useMemo } from 'react';

import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import {
  buildUnifiedFromSnapshot,
  ProcessVisualizationUnifiedData,
} from 'app/modules/process-visualization/process-visualization-unified.model';
import { YAML_VISUALIZATION_BASE_PATH } from 'app/modules/process-visualization/process-visualization-paths';
import { useProcessVisualizationData } from 'app/modules/process-visualization/use-process-visualization-data';

const ProcessVisualizationContext = createContext<ProcessVisualizationUnifiedData | null>(null);

export const ProcessVisualizationProvider = ({ processId, children }: { processId: number; children: React.ReactNode }) => {
  const data = useProcessVisualizationData(processId);
  return <ProcessVisualizationContext.Provider value={data}>{children}</ProcessVisualizationContext.Provider>;
};

export const ProcessYamlVisualizationProvider = ({ snapshot, children }: { snapshot: ProcessSnapshot; children: React.ReactNode }) => {
  const data = useMemo(() => buildUnifiedFromSnapshot(snapshot, YAML_VISUALIZATION_BASE_PATH), [snapshot]);
  return <ProcessVisualizationContext.Provider value={data}>{children}</ProcessVisualizationContext.Provider>;
};

export const ProcessVisualizationStaticProvider = ({ snapshot, children }: { snapshot: ProcessSnapshot; children: React.ReactNode }) => {
  const data = useMemo(() => buildUnifiedFromSnapshot(snapshot, ''), [snapshot]);
  return <ProcessVisualizationContext.Provider value={data}>{children}</ProcessVisualizationContext.Provider>;
};

export const useProcessVisualization = (): ProcessVisualizationUnifiedData => {
  const context = useContext(ProcessVisualizationContext);
  if (!context) {
    throw new Error('useProcessVisualization must be used within a ProcessVisualization provider');
  }
  return context;
};
