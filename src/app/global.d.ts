declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    twttr?: {
      widgets: {
        load: (target?: HTMLElement | undefined) => void;
      };
    };
  }
}

export {};