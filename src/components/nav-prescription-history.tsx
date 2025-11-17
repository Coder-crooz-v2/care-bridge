"use client";

import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Stethoscope,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Trash2,
  Calendar,
  Pill,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import {
  PrescriptionHistoryService,
  PrescriptionHistory,
} from "@/lib/prescription-history-service";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { usePrescriptionList } from "@/store/usePrescriptionList";
import { set } from "date-fns";
import { useAuthStore } from "@/store/useAuth";

interface NavPrescriptionHistoryProps {
  activePrescriptionId?: string;
}

export function NavPrescriptionHistory({
  activePrescriptionId,
}: NavPrescriptionHistoryProps) {
  const { prescriptionList, setPrescriptionList } = usePrescriptionList();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/prescriptions?user_id=${user?.id}`
      );

      if (response.data && response.data.length > 0) {
        setPrescriptionList(response.data);
      } else {
        setPrescriptionList([]);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Failed to load prescription history", {
        description:
          error instanceof AxiosError ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchPrescriptions();
  }, [user]);

  const handleNewPrescription = () => {
    router.push("/dashboard/prescription-extractor");
  };

  const handlePrescriptionClick = (prescriptionId: string) => {
    router.push(`/dashboard/prescription-extractor?id=${prescriptionId}&from=history`);
  };

  const handleDeletePrescription = async (
    prescriptionId: string,
    title: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await axios.delete(
        `/api/prescriptions?id=${prescriptionId}`
      );
      if (response.status === 200) {
        toast.success("Prescription deleted successfully");
        setPrescriptionList(
          prescriptionList.filter((p) => p.id !== prescriptionId)
        );
        router.push("/dashboard/prescription-extractor");
      } else {
        toast.error(response.data.error || "Failed to delete prescription");
      }
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Failed to delete prescription", {
        description:
          error instanceof AxiosError ? error.message : "Unknown error",
      });
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Prescription Extractor</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Upload new"
            onClick={handleNewPrescription}
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Upload new</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible
          defaultOpen={pathname.includes("/dashboard/prescription-extractor")}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Prescription History">
                <Stethoscope className="h-4 w-4" />
                <span>Prescription History</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {/* Loading State */}
                {loading && (
                  <SidebarMenuSubItem>
                    <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground mr-2" />
                      Loading...
                    </div>
                  </SidebarMenuSubItem>
                )}

                {/* Prescription History */}
                {!loading &&
                  prescriptionList.map((prescription) => (
                    <SidebarMenuSubItem key={prescription.id}>
                      <SidebarMenuButton
                        asChild
                        size="sm"
                        isActive={activePrescriptionId === prescription.id}
                        className="group/item"
                      >
                        <button
                          onClick={() =>
                            handlePrescriptionClick(prescription.id)
                          }
                          className="w-full text-left"
                        >
                          <div className="flex items-center w-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">
                                {prescription.title}
                              </div>
                            </div>
                          </div>
                        </button>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                        showOnHover
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent">
                              <MoreHorizontal className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleDeletePrescription(
                                  prescription.id,
                                  prescription.title
                                )
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuAction>
                    </SidebarMenuSubItem>
                  ))}

                {/* Empty State */}
                {!loading && prescriptionList.length === 0 && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      No prescriptions yet
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
