"use client";

import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/useAuth";
import { createClient } from "@/utils/supabase/client";
import { Separator } from "@radix-ui/react-separator";
import { redirect, useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useAuthStore();
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is chat interface
  const isChatInterface = pathname?.includes("/dashboard/chat");

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to fetch user data");
        console.error("Error fetching user:", error);
        return;
      }
      if (!data.user) {
        redirect("/auth/login");
      } else {
        setUser(data.user);
      }
    }

    fetchUser();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        <div className="flex flex-1 w-full">
          <Suspense
            fallback={<div className="w-64 bg-muted/30 animate-pulse" />}
          >
            <AppSidebar />
          </Suspense>
          <SidebarInset className="bg-background flex flex-col relative">
            {isChatInterface && (
              <header className="flex absolute w-full h-14 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-2 sm:px-4 bg-transparent backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Suspense
                    fallback={
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    }
                  >
                    <DynamicBreadcrumb />
                  </Suspense>
                </div>
              </header>
            )}
            <main className="flex-1 flex overflow-hidden w-full">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
