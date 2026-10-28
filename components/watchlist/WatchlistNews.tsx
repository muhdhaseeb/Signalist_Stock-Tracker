import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function WatchlistNews({ news = [] }: WatchlistNewsProps) {
  if (news.length === 0) {
    return (
      <div className='p-8 text-center text-gray-500 bg-gray-800 border border-gray-600 rounded-xl'>
        No market news articles currently available. Check back soon.
      </div>
    );
  }

  return (
    <div className='watchlist-news'>
      {news.map((article) => {
        const date = new Date(article.datetime * 1000).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <article key={article.id} className='news-item flex flex-col justify-between'>
            <div>
              <span className='news-tag'>
                {article.category ? article.category.toUpperCase() : 'MARKET'}
              </span>

              <h3 className='news-title'>
                <a
                  href={article.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-yellow-400 transition-colors'
                >
                  {article.headline}
                </a>
              </h3>

              <div className='news-meta'>
                <span>{article.source}</span>
                <span className='mx-2'>•</span>
                <span>{date}</span>
              </div>

              <p className='news-summary'>{article.summary}</p>
            </div>

            <div className='pt-3 border-t border-gray-700/60 flex items-center justify-between'>
              <a
                href={article.url}
                target='_blank'
                rel='noopener noreferrer'
                className='news-cta flex items-center gap-1.5'
              >
                <span>Read Full Story</span>
                <ExternalLink className='h-3.5 w-3.5' />
              </a>

              {article.related && (
                <div className='flex gap-1.5'>
                  {article.related.split(',').slice(0, 3).map((sym) => (
                    <Link
                      key={sym}
                      href={`/stocks/${sym.trim()}`}
                      className='text-xs font-mono font-bold text-gray-400 hover:text-yellow-400'
                    >
                      ${sym.trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
