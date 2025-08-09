"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Brain, CheckCircle2, Loader2 } from "lucide-react";

interface ProcessingStepsProps {
  currentStep: number;
  progress: number;
}

const steps = [
  {
    id: 1,
    title: "Uploading Image",
    description: "Securely uploading your prescription image",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "Image Analysis",
    description: "Analyzing image quality and preprocessing",
    icon: Search,
    color: "text-purple-500",
  },
  {
    id: 3,
    title: "Text Extraction",
    description: "Extracting text from prescription using OCR",
    icon: Brain,
    color: "text-orange-500",
  },
  {
    id: 4,
    title: "Processing Complete",
    description: "Organizing medicine details and information",
    icon: CheckCircle2,
    color: "text-green-500",
  },
];

export default function ProcessingSteps({
  currentStep,
  progress,
}: ProcessingStepsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Processing Prescription
                </h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const IconComponent = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`
                      flex items-center gap-4 p-3 rounded-lg transition-all duration-300
                      ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : isCompleted
                          ? "bg-green-50 dark:bg-green-950/20"
                          : "bg-muted/30"
                      }
                    `}
                  >
                    {/* Step Icon */}
                    <div
                      className={`
                      flex items-center justify-center w-10 h-10 rounded-full
                      ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900"
                          : isActive
                          ? "bg-primary/20"
                          : "bg-muted"
                      }
                    `}
                    >
                      {isActive ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <IconComponent
                          className={`h-5 w-5 ${
                            isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : isActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <h4
                        className={`
                        font-medium ${
                          isCompleted
                            ? "text-green-700 dark:text-green-300"
                            : isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      `}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`
                        text-sm ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : isActive
                            ? "text-primary/80"
                            : "text-muted-foreground"
                        }
                      `}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center">
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, type: "spring" }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                      {isActive && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Processing Message */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center py-4"
            >
              <p className="text-sm text-muted-foreground">
                Please wait while we process your prescription...
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
