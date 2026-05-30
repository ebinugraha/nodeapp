"use client";

import { SearchIcon, KeyboardIcon } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "./global-search";

export const AppHeader = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { open, setOpen, GlobalSearchDialog } = useGlobalSearch();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <>
      <GlobalSearchDialog />

      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <SidebarTrigger />

        {/* Search Bar */}
        <Button
          variant="outline"
          className="relative flex-1 max-w-md justify-start text-muted-foreground hover:text-foreground h-9"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="mr-2 size-4" />
          <span className="truncate">Search...</span>
          <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
                  <AvatarFallback suppressHydrationWarning>
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span suppressHydrationWarning>{user?.name ?? "User"}</span>
                  <span suppressHydrationWarning className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};
