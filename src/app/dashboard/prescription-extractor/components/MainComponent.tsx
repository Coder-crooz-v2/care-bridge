"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Stethoscope, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import FileUploadZone from "./FileUploadZone";
import ProcessingSteps from "./ProcessingSteps";
import PrescriptionResults from "./PrescriptionResults";
import ErrorDisplay from "./ErrorDisplay";
import { PrescriptionService } from "@/lib/prescription-service";
import { PrescriptionData } from "@/types/prescription";
import { ScrollArea } from "@/components/ui/scroll-area";

type AppState = "upload" | "processing" | "results" | "error";

const MainComponent = () => {
  const [currentState, setCurrentState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate processing steps with more realistic timing for ML processing
  useEffect(() => {
    if (currentState === "processing") {
      const steps = [
        { step: 1, duration: 500, progress: 15 }, // Upload & preprocessing
        { step: 2, duration: 2000, progress: 45 }, // OCR extraction
        { step: 3, duration: 3000, progress: 85 }, // AI analysis
        { step: 4, duration: 800, progress: 100 }, // Validation & formatting
      ];

      let timeouts: NodeJS.Timeout[] = [];
      let totalDelay = 0;

      steps.forEach(({ step, duration, progress: stepProgress }) => {
        const timeout = setTimeout(() => {
          setCurrentStep(step);
          setProgress(stepProgress);
        }, totalDelay);

        timeouts.push(timeout);
        totalDelay += duration;
      });

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [currentState]);

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
    setCurrentState("processing");
    setCurrentStep(1);
    setProgress(0);
    setError(null);

    try {
      // Use real API service
      const response = await PrescriptionService.uploadPrescription(
        selectedFile
      );

      if (response.success && response.data) {
        setPrescriptionData(response.data);
        setCurrentState("results");
        toast.success("Prescription processed successfully!");
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

  const handleStartOver = () => {
    setCurrentState("upload");
    setSelectedFile(null);
    setIsUploading(false);
    setCurrentStep(1);
    setProgress(0);
    setPrescriptionData(null);
    setError(null);
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleUpload();
    } else {
      handleStartOver();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full mt-16 bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 p-4 sm:p-6 border-b border-border"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Start Over</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <ScrollArea className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {currentState === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <FileUploadZone
                  onFileSelect={handleFileSelect}
                  isUploading={isUploading}
                  selectedFile={selectedFile}
                  onFileRemove={handleFileRemove}
                />

                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      size="lg"
                      className="px-8 py-3 text-base font-medium"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Decode Prescription"
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentState === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessingSteps
                  currentStep={currentStep}
                  progress={progress}
                />
              </motion.div>
            )}

            {currentState === "results" && prescriptionData && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <PrescriptionResults data={prescriptionData} />
              </motion.div>
            )}

            {currentState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorDisplay
                  error={error || "An unexpected error occurred"}
                  onRetry={handleRetry}
                  onStartOver={handleStartOver}
                  fileName={selectedFile?.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MainComponent;
