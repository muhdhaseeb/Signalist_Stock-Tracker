"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import NavItems from "./NavItems";

const UserDropdown = () => {
  const router = useRouter();

  const handleSignOut : () => Promise<void> = async() => {
    router.push("/signin");
  }

  const user = {
    name: "John",
    email: "contact@jsmastery.com",
  }

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 text-gray-400 hover:text-yellow-500">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start ">
            <span className="text-base font-medium text-gray-400">
              {user.name}
            </span>
          </div>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="text-gray-400">
      <DropdownMenuLabel>
      <div className="flex relative items-center gap-3 py-2">
        <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base font-medium text-gray-400">
              {user.name}
            </span>
            <span className="text-sm text-gray-500">
              {user.email}
            </span>
          </div>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-gray-600"/>
    <DropdownMenuItem className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer" onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4 hidden sm:block " />
      LogOut
    </DropdownMenuItem>
    <DropdownMenuSeparator className="hidden sm:block bg-gray-600"/>
    <nav className="sm:hidden">
      <NavItems />
    </nav>
    </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown