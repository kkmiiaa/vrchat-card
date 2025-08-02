declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    twttr?: {
      widgets: {
        load: (target?: HTMLElement | undefined) => void;
      };
    };
  }

  type MarkOption = '―' | '◎' | '◯' | '△' | '✗';

  type InteractionItem = {
    label: string;
    mark: MarkOption | string;
    isCustom?: boolean;
  };

  type FontKey = 'rounded' | 'kosugi' | 'zenmaru' | 'uzura' | 'kawaii' | 'maruminya';

  type Area = {
    width: number;
    height: number;
    x: number;
    y: number;
  }
}

export {};