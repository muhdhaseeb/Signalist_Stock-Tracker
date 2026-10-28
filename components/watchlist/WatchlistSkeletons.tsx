export default function WatchlistSkeletons() {
  return (
    <div className='w-full space-y-4 animate-pulse'>
      <div className='h-12 bg-gray-800 rounded-lg border border-gray-700' />
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className='h-16 bg-gray-800/60 rounded-lg border border-gray-700 flex items-center justify-between px-4'
        >
          <div className='flex items-center gap-3 w-1/3'>
            <div className='w-8 h-8 rounded-full bg-gray-700' />
            <div className='space-y-2 flex-1'>
              <div className='h-4 bg-gray-700 rounded w-24' />
              <div className='h-3 bg-gray-700/60 rounded w-16' />
            </div>
          </div>
          <div className='h-4 bg-gray-700 rounded w-20' />
          <div className='h-4 bg-gray-700 rounded w-16' />
          <div className='h-4 bg-gray-700 rounded w-20' />
          <div className='h-8 bg-gray-700 rounded w-20' />
        </div>
      ))}
    </div>
  );
}
