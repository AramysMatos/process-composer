import React, { createContext, useContext } from 'react';

import { ProcessVisualizationData, useProcessVisualizationData } from 'app/modules/process-visualization/use-process-visualization-data';

const ProcessVisualizationContext = createContext<ProcessVisualizationData | null>(null);

export const ProcessVisualizationProvider = ({ processId, children }: { processId: number; children: React.ReactNode }) => {
  const data = useProcessVisualizationData(processId);
  return <ProcessVisualizationContext.Provider value={data}>{children}</ProcessVisualizationContext.Provider>;
};

export const useProcessVisualization = (): ProcessVisualizationData => {
  const context = useContext(ProcessVisualizationContext);
  if (!context) {
    throw new Error('useProcessVisualization must be used within ProcessVisualizationProvider');
  }
  return context;
};
