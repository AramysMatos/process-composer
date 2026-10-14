import { useCallback, useState } from 'react';

export const CANVAS_SIDEBAR_VISIBLE_STORAGE_KEY = 'process-canvas-sidebar-visible';

const readStoredVisibility = (): boolean => {
  try {
    const stored = localStorage.getItem(CANVAS_SIDEBAR_VISIBLE_STORAGE_KEY);
    if (stored === 'false') {
      return false;
    }
    if (stored === 'true') {
      return true;
    }
  } catch {
    // ignore
  }
  return true;
};

export const useCanvasSidebarVisible = () => {
  const [visible, setVisible] = useState(readStoredVisibility);

  const toggle = useCallback(() => {
    setVisible(current => {
      const next = !current;
      try {
        localStorage.setItem(CANVAS_SIDEBAR_VISIBLE_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const show = useCallback(() => {
    setVisible(true);
    try {
      localStorage.setItem(CANVAS_SIDEBAR_VISIBLE_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(CANVAS_SIDEBAR_VISIBLE_STORAGE_KEY, 'false');
    } catch {
      // ignore
    }
  }, []);

  return { visible, toggle, show, hide };
};
