"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Stethoscope, Upload, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import {
  PrescriptionData,
  MedicineDetail,
  ReminderSettings,
} from "@/types/prescription";
import { PrescriptionService } from "@/lib/prescription-service";
import { PrescriptionHistoryService } from "@/lib/prescription-history-service";
import { useRouter, useSearchParams } from "next/navigation";

// Import components
import FileUploadZone from "./FileUploadZone";
import ImagePreviewPanel from "./ImagePreviewPanel";
import EditablePrescriptionResults from "./EditablePrescriptionResults";
import MedicineReminderCalendar from "./MedicineReminderCalendar";

type AppState = "upload" | "results" | "error";

const MainComponent = () => {
  const [mounted, setMounted] = useState(false);
  const [currentState, setCurrentState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionData | null>(null);
  const [medicines, setMedicines] = useState<MedicineDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "calendar">("results");
  const [isSaving, setIsSaving] = useState(false);
  const [loadedPrescriptionId, setLoadedPrescriptionId] = useState<
    string | null
  >(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [reminderDates, setReminderDates] = useState<ReminderSettings[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get("id");

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load existing prescription if ID is provided
  useEffect(() => {
    if (!mounted) return;

    const loadPrescription = async () => {
      if (prescriptionId && prescriptionId !== loadedPrescriptionId) {
        try {
          const response =
            await PrescriptionHistoryService.getPrescriptionHistory();
          if (response.success && response.data) {
            const prescription = response.data.find(
              (p) => p.id === prescriptionId
            );
            if (prescription) {
              setMedicines(prescription.medicines);
              setImageUrl(prescription.image_url || null);
              setPrescriptionData(prescription.extracted_data || null);

              // Load reminder dates if they exist
              if (
                prescription.reminder_dates &&
                Array.isArray(prescription.reminder_dates)
              ) {
                // Convert date strings back to Date objects
                const loadedReminders: ReminderSettings[] =
                  prescription.reminder_dates.map((reminder: any) => ({
                    ...reminder,
                    reminderDates: reminder.reminderDates.map(
                      (dateStr: string) => new Date(dateStr)
                    ),
                  }));
                setReminderDates(loadedReminders);
              } else {
                setReminderDates([]);
              }

              setCurrentState("results");
              setActiveTab("results");
              setLoadedPrescriptionId(prescriptionId);
              toast.success("Prescription loaded successfully!");
            }
          }
        } catch (error) {
          console.error("Error loading prescription:", error);
          toast.error("Failed to load prescription");
        }
      } else if (!prescriptionId && loadedPrescriptionId) {
        // If no prescription ID in URL but we had one loaded, reset to upload
        handleStartOver();
      }
    };

    loadPrescription();
  }, [prescriptionId, loadedPrescriptionId, mounted]);

  // Listen for start new prescription events
  useEffect(() => {
    if (!mounted) return;

    const handleStartNewPrescription = () => {
      handleStartOver();
    };

    window.addEventListener(
      "start-new-prescription",
      handleStartNewPrescription
    );

    return () => {
      window.removeEventListener(
        "start-new-prescription",
        handleStartNewPrescription
      );
    };
  }, [mounted]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setCurrentState("upload");
    setError(null);

    try {
      const response = await PrescriptionService.uploadPrescription(
        selectedFile
      );

      if (response.success && response.data) {
        setPrescriptionData(response.data);
        setMedicines(response.data.medicine_dosage_details || []);
        setImageUrl(response.data.image_url || null);
        setCurrentState("results");
        setLoadedPrescriptionId(null); // Clear loaded prescription ID for new upload
        toast.success("Prescription processed successfully!");

        // Auto-save the prescription with image URL
        if (response.data.image_url) {
          await handleAutoSavePrescription(response.data);
        }
      } else {
        throw new Error(response.error || "Failed to process prescription");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setCurrentState("error");
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDetectAgain = async () => {
    if (!selectedFile) {
      toast.error("No file selected to re-detect");
      return;
    }

    await handleUpload();
  };

  const handleSavePrescription = async () => {
    if (!medicines.length) {
      toast.error("No medicines to save");
      return;
    }

    setIsSaving(true);

    try {
      const title = `Prescription ${new Date().toLocaleDateString()}`;
      const response = await PrescriptionHistoryService.savePrescription({
        title,
        imageUrl: prescriptionData?.image_url,
        medicines,
        extractedData: prescriptionData,
        reminderDates: null, // This will be populated by the calendar component
      });

      if (response.success && response.data) {
        toast.success("Prescription saved successfully!");
        setLoadedPrescriptionId(response.data.id);
        // Update URL to include the prescription ID
        router.push(`/dashboard/prescription-extractor?id=${response.data.id}`);
        // Notify sidebar to refresh
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("prescription-updated"));
        }
      } else {
        toast.error(response.error || "Failed to save prescription");
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error("Failed to save prescription");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSavePrescription = async (data: PrescriptionData) => {
    try {
      const title = `Prescription ${new Date().toLocaleDateString()}`;
      const response = await PrescriptionHistoryService.savePrescription({
        title,
        imageUrl: data.image_url,
        medicines: data.medicine_dosage_details || [],
        extractedData: data,
        reminderDates: null,
      });

      if (response.success && response.data) {
        setLoadedPrescriptionId(response.data.id);
        router.push(`/dashboard/prescription-extractor?id=${response.data.id}`);
        // Trigger sidebar refresh
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("prescription-updated"));
        }
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      // Don't show error toast for auto-save failures
    }
  };

  const handleMedicinesUpdate = async (updatedMedicines: MedicineDetail[]) => {
    setMedicines(updatedMedicines);
    // Update the original prescription data as well
    if (prescriptionData) {
      setPrescriptionData({
        ...prescriptionData,
        medicine_dosage_details: updatedMedicines,
        total_medicines: updatedMedicines.length,
      });
    }

    // If we have a loaded prescription, save the updates to the database
    if (loadedPrescriptionId) {
      try {
        const response = await PrescriptionHistoryService.updatePrescription(
          loadedPrescriptionId,
          {
            medicines: updatedMedicines,
            extracted_data: prescriptionData
              ? {
                  ...prescriptionData,
                  medicine_dosage_details: updatedMedicines,
                  total_medicines: updatedMedicines.length,
                }
              : null,
          }
        );

        if (response.success) {
          // Notify sidebar to refresh
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("prescription-updated"));
          }
        } else {
          console.error("Failed to update prescription:", response.error);
          // Don't show error toast for auto-updates to avoid interrupting user flow
        }
      } catch (error) {
        console.error("Error updating prescription:", error);
        // Don't show error toast for auto-updates
      }
    }
  };

  const handleStartOver = () => {
    setCurrentState("upload");
    setSelectedFile(null);
    setIsUploading(false);
    setPrescriptionData(null);
    setMedicines([]);
    setImageUrl(null);
    setReminderDates([]);
    setError(null);
    setActiveTab("results");
    setLoadedPrescriptionId(null);
    router.push("/dashboard/prescription-extractor");
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleUpload();
    } else {
      handleStartOver();
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] w-full mt-10 bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 p-4 sm:p-6 border-b border-border"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Prescription Decoder
              </h1>
              <p className="text-sm text-muted-foreground">
                Upload your prescription image to extract medicine details
              </p>
            </div>
          </div>

          {currentState !== "upload" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleStartOver}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Start Over</span>
              </Button>

              {currentState === "results" && selectedFile && (
                <Button
                  variant="outline"
                  onClick={handleDetectAgain}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isUploading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Detect Again</span>
                </Button>
              )}

              {currentState === "results" &&
                medicines.length > 0 &&
                !loadedPrescriptionId && (
                  <Button
                    onClick={handleSavePrescription}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Save Prescription
                        </span>
                      </>
                    )}
                  </Button>
                )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {currentState === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
              >
                {/* Left Column - Upload Zone */}
                <div className="space-y-6">
                  <FileUploadZone
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                    selectedFile={selectedFile}
                    onFileRemove={handleFileRemove}
                  />

                  {selectedFile && (
                    <div className="flex justify-center">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        size="lg"
                        className="w-full max-w-xs"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Decode Prescription
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right Column - Image Preview */}
                <ImagePreviewPanel
                  selectedFile={selectedFile}
                  imageUrl={imageUrl}
                  onFileRemove={handleFileRemove}
                />
              </motion.div>
            )}

            {currentState === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
              >
                {/* Left Column - Image Preview */}
                <div className="space-y-4">
                  <ImagePreviewPanel
                    selectedFile={selectedFile}
                    imageUrl={imageUrl}
                    onFileRemove={handleFileRemove}
                  />

                  {prescriptionData?.disclaimer && (
                    <div className="p-4 bg-warning/20 border border-warning rounded-lg">
                      <p className="text-sm text-warning font-medium">
                        ⚠️ Important Disclaimer
                      </p>
                      <p className="text-xs text-warning/80 mt-1">
                        {prescriptionData.disclaimer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Results and Calendar */}
                <div className="space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("results")}
                      className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-all ${
                        activeTab === "results"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Medicine Details
                    </button>
                    <button
                      onClick={() => setActiveTab("calendar")}
                      className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-all ${
                        activeTab === "calendar"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Reminders
                    </button>
                  </div>

                  {/* Tab Content */}
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    {activeTab === "results" ? (
                      <EditablePrescriptionResults
                        medicines={medicines}
                        onMedicinesUpdate={handleMedicinesUpdate}
                      />
                    ) : (
                      <MedicineReminderCalendar
                        medicines={medicines}
                        prescriptionId={loadedPrescriptionId}
                        initialReminders={reminderDates}
                      />
                    )}
                  </ScrollArea>
                </div>
              </motion.div>
            )}

            {currentState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
              >
                {/* Left Column - Image Preview */}
                <ImagePreviewPanel
                  selectedFile={selectedFile}
                  imageUrl={imageUrl}
                  onFileRemove={handleFileRemove}
                />

                {/* Right Column - Error Message */}
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        className="w-8 h-8 text-destructive"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Processing Failed
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {error}
                      </p>
                      <div className="space-y-2">
                        <Button onClick={handleRetry} className="w-full">
                          Try Again
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleStartOver}
                          className="w-full"
                        >
                          Upload Different Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
