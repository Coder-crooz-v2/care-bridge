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

interface NavPrescriptionHistoryProps {
  activePrescriptionId?: string;
}

export function NavPrescriptionHistory({
  activePrescriptionId,
}: NavPrescriptionHistoryProps) {
  const [mounted, setMounted] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response =
        await PrescriptionHistoryService.getPrescriptionHistory();
      if (response.success && response.data) {
        setPrescriptions(response.data);
      } else {
        console.error("Failed to fetch prescriptions:", response.error);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    fetchPrescriptions();

    // Listen for prescription updates from other components
    const handlePrescriptionUpdate = () => {
      fetchPrescriptions();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("prescription-updated", handlePrescriptionUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "prescription-updated",
          handlePrescriptionUpdate
        );
      }
    };
  }, [mounted]);

  const handleNewPrescription = () => {
    // Clear any existing prescription ID from URL and force reload to upload state
    router.push("/dashboard/prescription-extractor");
    // Dispatch event to reset the main component
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("start-new-prescription"));
    }
  };

  const handlePrescriptionClick = (prescriptionId: string) => {
    router.push(`/dashboard/prescription-extractor?id=${prescriptionId}`);
  };

  const handleDeletePrescription = async (
    prescriptionId: string,
    title: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const response = await PrescriptionHistoryService.deletePrescription(
      prescriptionId
    );
    if (response.success) {
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      toast.success("Prescription deleted successfully");

      // If we're currently viewing this prescription, redirect to main page
      if (activePrescriptionId === prescriptionId) {
        router.push("/dashboard/prescription-extractor");
        // Dispatch event to reset the main component to upload state
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("start-new-prescription"));
        }
      }
    } else {
      toast.error(response.error || "Failed to delete prescription");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMedicineCount = (medicines: any[]): number => {
    return medicines?.length || 0;
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Prescription History</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground mr-2" />
              Loading...
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Prescription History</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          defaultOpen={pathname.includes("/dashboard/prescription-extractor")}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip="Prescription Extractor"
                className="font-medium"
                onClick={() => {
                  if (!pathname.includes("/dashboard/prescription-extractor")) {
                    handleNewPrescription();
                  }
                }}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Prescription Extractor</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu>
                {/* New Prescription Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <button onClick={handleNewPrescription}>
                      <Plus className="h-3 w-3" />
                      <span>New Prescription</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Loading State */}
                {loading && (
                  <SidebarMenuItem>
                    <div className="flex items-center px-2 py-1 text-xs text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground mr-2" />
                      Loading...
                    </div>
                  </SidebarMenuItem>
                )}

                {/* Prescription History */}
                {!loading &&
                  prescriptions.map((prescription) => (
                    <SidebarMenuItem key={prescription.id}>
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
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Pill className="h-3 w-3" />
                                  {getMedicineCount(prescription.medicines)}
                                </div>
                                <span>
                                  {formatDate(prescription.created_at)}
                                </span>
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
                              onClick={() =>
                                handlePrescriptionClick(prescription.id)
                              }
                            >
                              <Stethoscope className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
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
                    </SidebarMenuItem>
                  ))}

                {/* Empty State */}
                {!loading && prescriptions.length === 0 && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      No prescriptions yet
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
