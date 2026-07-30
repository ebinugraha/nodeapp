"use client";

import {
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  Loader2Icon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useCreateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const menuItems = [
  {
    title: "Workflows",
    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        icon: SettingsIcon,
        url: "/settings",
      },
    ],
  },
];

export const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const createWorkflow = useCreateWorkflow();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const avatarSrc =
    user?.image ||
    (user?.email
      ? `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=transparent`
      : undefined);

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
    });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-3 p-3">
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/workflows" prefetch>
              <Image
                src={"/logos/logo.svg"}
                alt="Cleenchat"
                width={30}
                height={30}
              />
              <span className="font-semibold text-sm">CleenChat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Create Workflow Button */}
        <Button
          onClick={handleCreateWorkflow}
          disabled={createWorkflow.isPending}
          className="w-full gap-x-2 h-8 group-data-[collapsible=icon]:p-0"
          size="sm"
          variant="outline"
        >
          {createWorkflow.isPending ? (
            <Loader2Icon className="size-4 animate-spin shrink-0" />
          ) : (
            <PlusIcon className="size-4 shrink-0" />
          )}
          <span className="group-data-[collapsible=icon]:hidden">Create Workflow</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="gap-x-4 h-10 px-4"
                    tooltip={item.title}
                    // Highlight the menu item if the current pathname starts with the item's URL
                    isActive={
                      item.url === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.url)
                    }
                    asChild
                  >
                    <Link href={item.url} prefetch>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-auto p-1.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/50 group-data-[collapsible=icon]:!p-0"
                >
                  <Avatar className="h-8 w-8 rounded-full border border-border/50 shadow-sm shrink-0">
                    <AvatarImage src={avatarSrc} alt={user?.name ?? "User"} />
                    <AvatarFallback className="rounded-full bg-primary/10 text-primary font-medium">
                      {mounted ? (user?.name?.charAt(0).toUpperCase() ?? "U") : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left space-y-0.5 group-data-[collapsible=icon]:hidden ml-1.5 overflow-hidden">
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate font-semibold text-sm tracking-tight">{mounted ? (user?.name ?? "User") : "User"}</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {mounted && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-1",
                          (user as any)?.plan === "PRO" 
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm" 
                            : "bg-muted text-muted-foreground border border-border/50"
                        )}>
                          {(user as any)?.plan === "PRO" ? "PRO" : "FREE"}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[11px] text-muted-foreground/80 font-medium">{mounted ? user?.email : "Loading..."}</span>
                  </div>
                  <ChevronsUpDown className="ml-2 size-4 text-muted-foreground/70 group-data-[collapsible=icon]:hidden shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border/50 shadow-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm bg-muted/30">
                    <Avatar className="h-10 w-10 rounded-full border border-border/50 shadow-sm">
                      <AvatarImage src={avatarSrc} alt={user?.name ?? "User"} />
                      <AvatarFallback className="rounded-full bg-primary/10 text-primary font-medium text-base">
                      {mounted ? (user?.name?.charAt(0).toUpperCase() ?? "U") : "U"}
                    </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left space-y-0.5 overflow-hidden">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-semibold tracking-tight">{mounted ? (user?.name ?? "User") : "User"}</span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {mounted && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-1",
                            (user as any)?.plan === "PRO" 
                              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm" 
                              : "bg-muted text-muted-foreground border border-border/50"
                          )}>
                            {(user as any)?.plan === "PRO" ? "PRO" : "FREE"}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground/80 font-medium">{mounted ? user?.email : "Loading..."}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/login");
                        },
                      },
                    })
                  }
                  className="text-destructive"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
