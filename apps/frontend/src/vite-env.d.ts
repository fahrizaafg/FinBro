/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    toggleFullscreen: () => void;
    checkFullscreen: () => Promise<boolean>;
    onFullscreenChange: (callback: (isFullscreen: boolean) => void) => () => void;
  };
}
