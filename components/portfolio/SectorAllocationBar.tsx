interface SectorItem {
  sector: string;
  value: number;
  percentage: number;
}

const COLORS = [
  '#E8BA40', // yellow
  '#0FEDBE', // teal
  '#5862FF', // blue
  '#D13BFF', // purple
  '#FF8243', // orange
  '#FF495B', // red
];

export default function SectorAllocationBar({
  allocation,
}: {
  allocation: SectorItem[];
}) {
  if (allocation.length === 0) {
    return (
      <div className='p-4 text-center text-xs text-gray-500 bg-gray-800 border border-gray-600 rounded-xl'>
        No holdings available for sector allocation.
      </div>
    );
  }

  return (
    <div className='bg-gray-800 border border-gray-600 rounded-xl p-5 space-y-4'>
      <div className='flex items-center justify-between pb-3 border-b border-gray-700'>
        <h2 className='text-lg font-bold text-gray-100'>Sector Allocation</h2>
        <span className='text-xs text-gray-400'>{allocation.length} Sectors</span>
      </div>

      {/* Multi-segment horizontal progress bar */}
      <div className='w-full h-3 rounded-full overflow-hidden flex bg-gray-700'>
        {allocation.map((item, idx) => (
          <div
            key={item.sector}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: COLORS[idx % COLORS.length],
            }}
            title={`${item.sector}: ${item.percentage}% ($${item.value.toLocaleString()})`}
            className='h-full transition-all'
          />
        ))}
      </div>

      {/* Legend Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1'>
        {allocation.map((item, idx) => (
          <div key={item.sector} className='flex items-center gap-2 text-xs'>
            <span
              className='h-2.5 w-2.5 rounded-full shrink-0'
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className='text-gray-300 truncate'>{item.sector}</span>
            <span className='text-gray-500 font-semibold ml-auto'>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

