'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import NavItems from './NavItems';

interface UserDropdownProps {
  initialUser?: {
    name: string;
    email: string;
  } | null;
}

const UserDropdown = ({ initialUser }: UserDropdownProps) => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string }>(
    initialUser || { name: 'Investor', email: 'investor@signalist.com' }
  );

  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => {
          if (data?.session) {
            setUser({
              name: data.session.name || 'Investor',
              email: data.session.email || '',
            });
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {
      // Ignored
    } finally {
      router.push('/sign-in');
      router.refresh();
    }
  };

  const initial = user.name ? user.name[0].toUpperCase() : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex items-center gap-3 text-gray-400 hover:text-yellow-500'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className='hidden md:flex flex-col items-start'>
            <span className='text-base font-medium text-gray-400'>{user.name}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='text-gray-400 bg-gray-800 border-gray-600'>
        <DropdownMenuLabel>
          <div className='flex relative items-center gap-3 py-2'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-base font-medium text-gray-200'>{user.name}</span>
              <span className='text-sm text-gray-400'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <DropdownMenuItem
          className='text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer'
          onClick={handleSignOut}
        >
          <LogOut className='mr-2 h-4 w-4 hidden sm:block' />
          Log Out
        </DropdownMenuItem>
        <DropdownMenuSeparator className='hidden sm:block bg-gray-600' />
        <nav className='sm:hidden'>
          <NavItems />
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
