import { pickRandomQuote } from '../lib/pick-random-quote';
import { quotes } from '../model/quote-data';
import { CloseQuote } from './CloseQuote';
import { OpenQuote } from './OpenQuote';

const quote = pickRandomQuote(quotes);

export function RandomQuote({ className }: React.ComponentProps<'figure'>) {
  return (
    <figure
      className={`${className} relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-lg p-8`}
    >
      <OpenQuote className="absolute -top-2 left-0 text-zinc-200 dark:text-zinc-600" />
      <blockquote className="w-full text-center text-zinc-400 dark:text-zinc-400 text-sm">
        {quote.original && <p className="original">{quote.original}</p>}
        {quote.translated && <p className="translated">{quote.translated}</p>}
        <footer>
          <cite className="source">— {quote.source}</cite>
        </footer>
      </blockquote>
      <CloseQuote className="absolute right-0 -bottom-2 text-zinc-200 dark:text-zinc-600" />
    </figure>
  );
}
