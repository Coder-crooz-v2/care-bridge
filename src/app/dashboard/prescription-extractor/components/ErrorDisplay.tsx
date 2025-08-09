"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Upload,
  WifiOff,
  FileX,
  Clock,
} from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onStartOver: () => void;
  fileName?: string;
}

export default function ErrorDisplay({
  error,
  onRetry,
  onStartOver,
  fileName,
}: ErrorDisplayProps) {
  // Determine error type and provide specific guidance
  const getErrorDetails = (errorMessage: string) => {
    const message = errorMessage.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return {
        type: "network",
        icon: WifiOff,
        title: "Connection Error",
        description:
          "Unable to connect to the processing server. Please check your internet connection.",
        suggestions: [
          "Check your internet connection",
          "Try again in a few moments",
          "Contact support if the issue persists",
        ],
        variant: "destructive" as const,
      };
    }

    if (
      message.includes("file") ||
      message.includes("format") ||
      message.includes("invalid")
    ) {
      return {
        type: "file",
        icon: FileX,
        title: "File Processing Error",
        description: "There was an issue processing your prescription image.",
        suggestions: [
          "Ensure the image is clear and well-lit",
          "Try a different image format (PNG or JPG)",
          "Make sure the prescription text is readable",
        ],
        variant: "destructive" as const,
      };
    }

    if (message.includes("timeout") || message.includes("time")) {
      return {
        type: "timeout",
        icon: Clock,
        title: "Processing Timeout",
        description: "The processing took longer than expected and timed out.",
        suggestions: [
          "Try uploading a smaller or clearer image",
          "Check your internet connection",
          "Retry the operation",
        ],
        variant: "destructive" as const,
      };
    }

    return {
      type: "generic",
      icon: AlertTriangle,
      title: "Processing Error",
      description: errorMessage,
      suggestions: [
        "Try uploading the image again",
        "Ensure the prescription is clearly visible",
        "Contact support if the problem continues",
      ],
      variant: "destructive" as const,
    };
  };

  const errorDetails = getErrorDetails(error);
  const IconComponent = errorDetails.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-destructive flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {errorDetails.title}
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {errorDetails.type.toUpperCase()} ERROR
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              {errorDetails.description}
            </p>

            {fileName && (
              <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/50 rounded">
                <strong>File:</strong> {fileName}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              What you can try:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={onRetry}
              className="flex items-center gap-2 flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={onStartOver}
              className="flex items-center gap-2 flex-1"
            >
              <Upload className="h-4 w-4" />
              Upload Different File
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              If you continue to experience issues, please contact support with
              the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
