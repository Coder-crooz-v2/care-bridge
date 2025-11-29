"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Calendar,
  CalendarCheck,
  Loader2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/app/auth/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  checkCalendarConnection,
  connectCalendar,
  disconnectCalendar,
} from "@/lib/calendar-service";
import { toast } from "sonner";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isCheckingCalendar, setIsCheckingCalendar] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check calendar connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkCalendarConnection();
        setIsCalendarConnected(status.connected);
      } catch (error) {
        console.error("Error checking calendar status:", error);
      } finally {
        setIsCheckingCalendar(false);
      }
    };

    checkStatus();
  }, []);

  const handleCalendarConnect = async () => {
    try {
      setIsConnecting(true);
      await connectCalendar();
    } catch (error) {
      toast.error("Connection Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect Google Calendar",
      });
      setIsConnecting(false);
    }
  };

  const handleCalendarDisconnect = async () => {
    try {
      setIsConnecting(true);
      const result = await disconnectCalendar();
      if (result.success) {
        setIsCalendarConnected(false);
        toast.success("Calendar Disconnected", {
          description:
            "Your Google Calendar has been disconnected successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Disconnection Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Google Calendar",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isCheckingCalendar ? (
                <DropdownMenuItem disabled>
                  <Loader2 className="animate-spin" />
                  Checking calendar...
                </DropdownMenuItem>
              ) : isCalendarConnected ? (
                <DropdownMenuItem
                  onClick={handleCalendarDisconnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CalendarCheck />
                  )}
                  {isConnecting
                    ? "Disconnecting..."
                    : "Disconnect Google Calendar"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleCalendarConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Calendar />
                  )}
                  {isConnecting ? "Connecting..." : "Connect Google Calendar"}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
