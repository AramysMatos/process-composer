import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export const SIDEBAR_WIDTH_STORAGE_KEY = 'process-overview-sidebar-width';

export const DEFAULT_SIDEBAR_WIDTH_PX = 288;
export const MIN_SIDEBAR_WIDTH_PX = 240;
export const MAX_SIDEBAR_WIDTH_PX = 560;
export const MAX_SIDEBAR_WIDTH_VW_RATIO = 0.45;

export const getMaxSidebarWidthPx = (): number => {
  if (typeof window === 'undefined') {
    return MAX_SIDEBAR_WIDTH_PX;
  }
  return Math.min(MAX_SIDEBAR_WIDTH_PX, Math.floor(window.innerWidth * MAX_SIDEBAR_WIDTH_VW_RATIO));
};

export const clampSidebarWidth = (widthPx: number): number => {
  const max = getMaxSidebarWidthPx();
  return Math.min(max, Math.max(MIN_SIDEBAR_WIDTH_PX, Math.round(widthPx)));
};

export const loadSidebarWidth = (): number => {
  try {
    const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (stored === null) {
      return DEFAULT_SIDEBAR_WIDTH_PX;
    }
    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_SIDEBAR_WIDTH_PX;
    }
    return clampSidebarWidth(parsed);
  } catch {
    return DEFAULT_SIDEBAR_WIDTH_PX;
  }
};

export const saveSidebarWidth = (widthPx: number): void => {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clampSidebarWidth(widthPx)));
  } catch {
    // ignore storage errors
  }
};

export function useResizableSidebarWidth() {
  const [widthPx, setWidthPx] = useState(loadSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const handleWindowResize = (): void => {
      setWidthPx(current => clampSidebarWidth(current));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [isResizing]);

  const resetWidth = useCallback(() => {
    setWidthPx(DEFAULT_SIDEBAR_WIDTH_PX);
    saveSidebarWidth(DEFAULT_SIDEBAR_WIDTH_PX);
  }, []);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      const resizerEl = event.currentTarget;
      dragRef.current = { startX: event.clientX, startWidth: widthPx };
      setIsResizing(true);
      resizerEl.setPointerCapture(event.pointerId);

      const handlePointerMove = (moveEvent: PointerEvent): void => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }
        const delta = moveEvent.clientX - drag.startX;
        setWidthPx(clampSidebarWidth(drag.startWidth + delta));
      };

      const handlePointerUp = (upEvent: PointerEvent): void => {
        if (upEvent.pointerId !== event.pointerId) {
          return;
        }
        dragRef.current = null;
        setIsResizing(false);
        setWidthPx(current => {
          saveSidebarWidth(current);
          return current;
        });
        resizerEl.releasePointerCapture(event.pointerId);
        resizerEl.removeEventListener('pointermove', handlePointerMove);
        resizerEl.removeEventListener('pointerup', handlePointerUp);
        resizerEl.removeEventListener('pointercancel', handlePointerUp);
      };

      resizerEl.addEventListener('pointermove', handlePointerMove);
      resizerEl.addEventListener('pointerup', handlePointerUp);
      resizerEl.addEventListener('pointercancel', handlePointerUp);
    },
    [widthPx]
  );

  const maxWidthPx = getMaxSidebarWidthPx();

  return {
    widthPx,
    maxWidthPx,
    minWidthPx: MIN_SIDEBAR_WIDTH_PX,
    isResizing,
    startResize,
    resetWidth,
  };
}
