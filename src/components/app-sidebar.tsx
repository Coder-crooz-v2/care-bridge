"use client";

import * as React from "react";
import {
  StethoscopeIcon,
  Heart,
  Activity,
  Pill,
  Building2,
  BookOpen,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavChatHistory } from "@/components/nav-chat-history";
import { NavPrescriptionHistory } from "@/components/nav-prescription-history";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuth";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// This is sample data.
const getData = (userData: User | null) => ({
  user: {
    name: userData?.user_metadata?.full_name || "User",
    email: userData?.email || "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "CareBridge",
      logo: StethoscopeIcon,
      plan: "Healthcare AI",
    },
  ],
  healthServices: [
    {
      title: "Health Monitoring",
      url: "/dashboard/health-monitoring",
      icon: Heart,
      description: "Track vitals and health metrics",
    },
    {
      title: "Health Blogs",
      url: "/dashboard/blogs",
      icon: BookOpen,
      description: "Health articles and wellness tips",
    },
    {
      title: "Nearby Services",
      url: "/dashboard/nearby-services",
      icon: Building2,
      description: "Find nearby clinics and pharmacies",
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const data = React.useMemo(() => getData(user), [user]);
  const [mounted, setMounted] = React.useState(false);
  const searchParams = useSearchParams();

  const [activeChatId, setActiveChatId] = React.useState<string | undefined>();
  const [activePrescriptionId, setActivePrescriptionId] = React.useState<
    string | undefined
  >();

  // Handle hydration and searchParams
  React.useEffect(() => {
    setMounted(true);
    setActiveChatId(searchParams.get("id") || undefined);
    setActivePrescriptionId(searchParams.get("id") || undefined);
  }, [searchParams]);

  if (!mounted) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavChatHistory activeChatId={activeChatId} />
        <NavPrescriptionHistory activePrescriptionId={activePrescriptionId} />

        {/* Health Services Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Health Services</SidebarGroupLabel>
          <SidebarMenu>
            {data.healthServices.map((service) => (
              <SidebarMenuItem key={service.title}>
                <SidebarMenuButton asChild tooltip={service.description}>
                  <Link href={service.url}>
                    <service.icon className="h-4 w-4" />
                    <span>{service.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
