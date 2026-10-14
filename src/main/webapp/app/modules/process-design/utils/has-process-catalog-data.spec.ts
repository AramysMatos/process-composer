import { hasProcessCatalogData } from './has-process-catalog-data';

describe('hasProcessCatalogData', () => {
  const processId = 10;

  it('returns false when there are no phases for the process', () => {
    expect(hasProcessCatalogData(processId, [{ id: 1, process: { id: 99 } }])).toBe(false);
  });

  it('returns true when the process has at least one phase even without activities', () => {
    expect(hasProcessCatalogData(processId, [{ id: 1, process: { id: processId } }])).toBe(true);
  });

  it('returns true when activities belong to phases of the process', () => {
    expect(hasProcessCatalogData(processId, [{ id: 1, process: { id: processId } }])).toBe(true);
  });
});
