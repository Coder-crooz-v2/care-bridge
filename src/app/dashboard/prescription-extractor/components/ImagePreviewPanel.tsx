"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImagePreviewPanelProps {
  selectedFile: File | null;
  imageUrl?: string | null;
  onFileRemove: () => void;
}

const ImagePreviewPanel: React.FC<ImagePreviewPanelProps> = ({
  selectedFile,
  imageUrl: providedImageUrl,
  onFileRemove,
}) => {
  const [mounted, setMounted] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    if (selectedFile && typeof window !== "undefined") {
      const url = URL.createObjectURL(selectedFile);
      setLocalImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setLocalImageUrl(null);
    }
  }, [selectedFile, mounted]);

  const displayImageUrl = localImageUrl || providedImageUrl;
  const hasImage = selectedFile || providedImageUrl;

  if (!hasImage || !displayImageUrl) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed">
        <div className="text-center p-8">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">No image uploaded</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a prescription to see preview here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full relative overflow-hidden bg-white">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="destructive"
          size="icon"
          onClick={onFileRemove}
          className="h-8 w-8 rounded-full shadow-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 h-full">
        <div className="relative h-full w-full">
          <Image
            src={displayImageUrl}
            alt="Prescription preview"
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="text-white text-sm font-medium truncate">
          {selectedFile?.name || "Prescription Image"}
        </p>
        {selectedFile && (
          <p className="text-white/80 text-xs">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>
    </Card>
  );
};

export default ImagePreviewPanel;
