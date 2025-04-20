import type { NonEmptyArray } from '../../../shared/model/utility-types';
import type { Quote } from '../model/quote-types';

export function pickRandomQuote(quotes: NonEmptyArray<Quote>): Quote {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}
