"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  StethoscopeIcon,
  Heart,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuth";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

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
    {
      name: "Health Analytics",
      logo: AudioWaveform,
      plan: "Pro",
    },
    {
      name: "Wellness Platform",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "AI Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Health Assistant",
          url: "#",
        },
        {
          title: "Symptom Checker",
          url: "#",
        },
        {
          title: "Wellness Coach",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "User Guide",
          url: "#",
        },
        {
          title: "Medical Disclaimer",
          url: "#",
        },
        {
          title: "Privacy Policy",
          url: "#",
        },
        {
          title: "FAQ",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Preferences",
          url: "#",
        },
        {
          title: "Privacy",
          url: "#",
        },
        {
          title: "Support",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Health Monitoring",
      url: "/dashboard/health-monitoring",
      icon: Heart,
    },
    {
      name: "Symptom Tracking",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Medication Reminders",
      url: "#",
      icon: Map,
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
