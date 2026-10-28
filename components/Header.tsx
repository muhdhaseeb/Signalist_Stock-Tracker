import Link from 'next/link';
import Image from 'next/image';
import NavItems from './NavItems';
import UserDropdown from '@/components/UserDropdown';
import SearchCommand from '@/components/SearchCommand';

const Header = () => {
  return (
    <header className='sticky top-0 z-50 header'>
      <div className='container header-wrapper flex items-center justify-between'>
        <div className='flex items-center gap-8'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/assets/icons/logo.svg'
              alt='Signalist logo'
              width={140}
              height={32}
              priority
              className='h-8 w-auto cursor-pointer'
            />
          </Link>
          <nav className='hidden sm:block'>
            <NavItems />
          </nav>
        </div>

        <div className='flex items-center gap-4'>
          <SearchCommand
            renderAs='button'
            buttonLabel='Search (⌘K)'
            buttonVariant='secondary'
            className='hidden md:flex border border-gray-600 rounded-lg px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300'
          />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
