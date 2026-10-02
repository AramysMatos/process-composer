import {
  clampSidebarWidth,
  DEFAULT_SIDEBAR_WIDTH_PX,
  loadSidebarWidth,
  MAX_SIDEBAR_WIDTH_PX,
  MIN_SIDEBAR_WIDTH_PX,
  saveSidebarWidth,
  SIDEBAR_WIDTH_STORAGE_KEY,
} from './use-resizable-sidebar-width';

describe('use-resizable-sidebar-width utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clamps width between min and max', () => {
    expect(clampSidebarWidth(100)).toBe(MIN_SIDEBAR_WIDTH_PX);
    expect(clampSidebarWidth(9999)).toBeLessThanOrEqual(MAX_SIDEBAR_WIDTH_PX);
    expect(clampSidebarWidth(300)).toBe(300);
  });

  it('loads default when storage is empty', () => {
    expect(loadSidebarWidth()).toBe(DEFAULT_SIDEBAR_WIDTH_PX);
  });

  it('persists and reloads width', () => {
    saveSidebarWidth(360);
    expect(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe('360');
    expect(loadSidebarWidth()).toBe(360);
  });
});
