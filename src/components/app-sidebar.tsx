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
          className="w-full gap-x-2 h-8"
          size="sm"
          variant="outline"
        >
          {createWorkflow.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <PlusIcon className="size-4" />
          )}
          <span>Create Workflow</span>
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarSrc} alt={user?.name ?? "User"} />
                    <AvatarFallback className="rounded-lg">
                      {mounted ? (user?.name?.charAt(0).toUpperCase() ?? "U") : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{mounted ? (user?.name ?? "User") : "User"}</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {mounted && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${(user as any)?.plan === "PRO" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {(user as any)?.plan === "PRO" ? "PRO" : "FREE"}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-xs">{mounted ? user?.email : ""}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={avatarSrc} alt={user?.name ?? "User"} />
                      <AvatarFallback className="rounded-lg">
                      {mounted ? (user?.name?.charAt(0).toUpperCase() ?? "U") : "U"}
                    </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold">{mounted ? (user?.name ?? "User") : "User"}</span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {mounted && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${(user as any)?.plan === "PRO" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {(user as any)?.plan === "PRO" ? "PRO" : "FREE"}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs">{mounted ? user?.email : ""}</span>
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
