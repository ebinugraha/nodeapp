"use client";

import { ChevronDown, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGlobalSearch } from "./global-search";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const AppHeader = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const avatarSrc =
    user?.image ||
    (user?.email
      ? `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=transparent`
      : undefined);
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

  const greetingText = `${getGreeting()}${user?.name ? `, ${user.name.split(" ")[0]}` : ""}!`;

  return (
    <>
      <GlobalSearchDialog />

      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <div className="flex flex-1 items-center gap-4">
          <SidebarTrigger />

          <div className="hidden md:flex flex-col">
            <span
              suppressHydrationWarning
              className="text-sm font-semibold tracking-tight"
            >
              {greetingText}
            </span>
            <span className="text-xs text-muted-foreground">
              Here is what's happening with your workflows today.
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <Button
          variant="outline"
          className="relative hidden lg:flex max-w-sm flex-1 justify-start text-muted-foreground hover:text-foreground h-9 bg-muted/50 border-muted/20"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="mr-2 size-4" />
          <span className="truncate">Search workflows, executions...</span>
          <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Mobile Search Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="size-5" />
        </Button>

        <div className="flex items-center gap-3 ml-auto lg:ml-4">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2 hover:bg-muted/50 rounded-full sm:rounded-md sm:pl-2 sm:pr-3"
              >
                <Avatar className="size-7">
                  <AvatarImage src={avatarSrc} alt={user?.name ?? "User"} />
                  <AvatarFallback suppressHydrationWarning className="text-xs">
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span
                    suppressHydrationWarning
                    className="text-sm font-medium leading-none"
                  >
                    {user?.name ?? "User"}
                  </span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground hidden sm:block ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span suppressHydrationWarning>{user?.name ?? "User"}</span>
                  <span
                    suppressHydrationWarning
                    className="text-xs text-muted-foreground font-normal"
                  >
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};
