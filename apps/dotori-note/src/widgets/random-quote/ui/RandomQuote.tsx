import { getRandomQuote } from '../model/get-random-quote';
import { CloseQuote } from './CloseQuote';
import { OpenQuote } from './OpenQuote';

const quote = getRandomQuote();

export function RandomQuote({ className }: React.ComponentProps<'figure'>) {
  return (
    <>
      {quote ? (
        <figure
          className={`${className} relative overflow-hidden z-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg`}
        >
          <OpenQuote className="absolute -top-2 left-0 text-zinc-200 dark:text-zinc-600" />
          <blockquote className="z-1 p-8 w-full text-center text-zinc-400 dark:text-zinc-400 text-sm">
            {quote.original && <p className="original">{quote.original}</p>}
            {quote.translated && (
              <p className="translated">{quote.translated}</p>
            )}
            <footer>
              <cite className="source">— {quote.source}</cite>
            </footer>
          </blockquote>
          <CloseQuote className="absolute right-0 -bottom-2 text-zinc-200 dark:text-zinc-600" />
        </figure>
      ) : null}
    </>
  );
}
