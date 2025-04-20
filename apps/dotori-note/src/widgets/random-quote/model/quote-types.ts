type QuoteBase = {
  source: string;
};

type QuoteWithOriginal = QuoteBase & {
  original: string;
  translated?: string;
};

type QuoteWithTranslatedOnly = QuoteBase & {
  original?: string;
  translated: string;
};

export type Quote = QuoteWithOriginal | QuoteWithTranslatedOnly;
