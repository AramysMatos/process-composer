import { isProcessVisualizationRoute, parseProcessVisualizationProcessId } from './process-visualization-routes';

describe('process-visualization-routes', () => {
  it('matches visualization paths', () => {
    expect(isProcessVisualizationRoute('/processos/42/visualizar')).toBe(true);
    expect(isProcessVisualizationRoute('/processos/42/visualizar/activities/7')).toBe(true);
    expect(isProcessVisualizationRoute('/processos/42/canvas')).toBe(false);
    expect(isProcessVisualizationRoute('/processos/42')).toBe(false);
  });

  it('parses process id from path', () => {
    expect(parseProcessVisualizationProcessId('/processos/99/visualizar/canvas')).toBe(99);
    expect(parseProcessVisualizationProcessId('/processos/abc/visualizar')).toBeUndefined();
  });
});
