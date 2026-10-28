import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Stocks | Signalist',
  description: 'Search and discover stocks across global markets.',
};

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Search Stocks</h1>
        <p className="text-gray-400">Search ticker symbols, companies, and explore market trends.</p>
      </div>
      <div className="p-8 bg-gray-800 border border-gray-600 rounded-lg text-center text-gray-400">
        Use the search bar or Cmd/Ctrl+K shortcut to search any stock ticker or company name.
      </div>
    </div>
  );
}
