import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * useAntiScreenRecord Hook
 * Multi-layer DRM, Screenshot Blocker, and Screen-Recording Prevention Engine
 */
export function useAntiScreenRecord(options = { enabled: true, showWarnings: true }) {
  const { enabled = true, showWarnings = true } = options;
  const [isScreenCaptureBlocked, setIsScreenCaptureBlocked] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // 1. Intercept Keyboard Shortcuts for Screenshot, Screen Recording & DevTools
    const handleKeyDown = (e) => {
      // PrintScreen (PrtScn)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        try {
          navigator.clipboard.writeText('');
        } catch (_) {}
        setIsScreenCaptureBlocked(true);
        if (showWarnings) {
          toast.error('⚠️ Screenshot & Screen Recording is prohibited on protected content.', {
            toastId: 'anti-record-warn'
          });
        }
        setTimeout(() => setIsScreenCaptureBlocked(false), 2500);
        return false;
      }

      // Windows Snipping Tool (Win + Shift + S) or Mac (Cmd + Shift + 3/4/5)
      if (
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        setIsScreenCaptureBlocked(true);
        setTimeout(() => setIsScreenCaptureBlocked(false), 2500);
        return false;
      }

      // Save page (Ctrl+S, Cmd+S), Print (Ctrl+P, Cmd+P), View Source (Ctrl+U)
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }

      // DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 2. Right-Click Context Menu Blocking
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Tab Visibility & Window Focus Shield
    // When user minimizes or switches windows (e.g. to open OBS or Snipping Tool), hide video content
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
      } else {
        setIsTabHidden(false);
      }
    };

    const handleWindowBlur = () => {
      setIsTabHidden(true);
    };

    const handleWindowFocus = () => {
      setIsTabHidden(false);
    };

    // 4. Hook Screen Recording API (navigator.mediaDevices.getDisplayMedia)
    let originalGetDisplayMedia = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async function () {
        if (showWarnings) {
          toast.error('⚠️ Screen Recording has been blocked by KV Cinema DRM Security.');
        }
        throw new Error('Screen recording is blocked on this website.');
      };
    }

    // Attach Listeners
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, [enabled, showWarnings]);

  return {
    isScreenCaptureBlocked: isScreenCaptureBlocked || isTabHidden,
    isTabHidden
  };
}

export default useAntiScreenRecord;
