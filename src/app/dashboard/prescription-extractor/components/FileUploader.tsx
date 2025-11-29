"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useAuthStore } from "@/store/useAuth";
import { usePrescriptionList } from "@/store/usePrescriptionList";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const FileUploader = ({
  files,
  setFiles,
  setCurrentState,
  setError,
}: {
  files: File[] | undefined;
  setFiles: (files: File[] | undefined) => void;
  setCurrentState: (
    state: "upload" | "processed" | "loading" | "error"
  ) => void;
  setError: (error: string | null) => void;
}) => {
  const { user } = useAuthStore();
  const { prescriptionList, setPrescriptionList, medicines, setMedicines } =
    usePrescriptionList();
  const router = useRouter();

  const parsePrescription = async (file: File) => {
    const formData = new FormData();
    formData.append("prescription", file);
    try {
      const response = await axios.post("/api/parse-prescription", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { medicines: parsedMedicines } = response.data;
      console.log("Parsed medicines:", parsedMedicines);
      setMedicines(parsedMedicines);
      return parsedMedicines; // Return the medicines
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast.error("Prescription parsing failed", {
        description:
          error instanceof AxiosError ? error.message : "Unknown error",
        duration: 5000,
      });
      throw error;
    } finally {
      setFiles(undefined);
    }
  };

  const uploadPrescription = async (file: File, parsedMedicines: any[]) => {
    if (!user) {
      toast.error("You must be logged in to upload a prescription.");
      return;
    }
    try {
      const res = await axios.post("/api/prescriptions", {
        user_id: user?.id,
        title:
          file.name.lastIndexOf(".") > 0
            ? file.name.substring(0, file.name.lastIndexOf("."))
            : file.name,
      });

      const prescriptionId = res.data.id as string;

      setPrescriptionList([
        ...(prescriptionList ?? []),
        {
          id: prescriptionId,
          user_id: user.id,
          title:
            file.name.lastIndexOf(".") > 0
              ? file.name.substring(0, file.name.lastIndexOf("."))
              : file.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Auto-save medicines to database and wait for completion
      await saveMedicinesToDatabase(prescriptionId, user.id, parsedMedicines);

      // Navigate after medicines are saved
      router.push(
        `/dashboard/prescription-extractor?id=${prescriptionId}&from=new_upload`
      );
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast.error("Prescription upload failed", {
        description:
          error instanceof AxiosError ? error.message : "Unknown error",
        duration: 5000,
      });
      throw error;
    } finally {
      setFiles(undefined);
    }
  };

  const saveMedicinesToDatabase = async (
    prescriptionId: string,
    userId: string,
    medicinesToSave: any[]
  ) => {
    try {
      if (!medicinesToSave || medicinesToSave.length === 0) {
        console.log("No medicines to save");
        return;
      }

      console.log("Saving medicines to database:", medicinesToSave);

      const savePromises = medicinesToSave.map((medicine) =>
        axios.post("/api/medicines", {
          user_id: userId,
          prescription_id: prescriptionId,
          medicine: medicine.medicine || "",
          dosage: medicine.dosage || null,
          duration: medicine.duration || 1,
          morning: medicine.morning || false,
          noon: medicine.noon || false,
          night: medicine.night || false,
          instructions: medicine.instructions || null,
          notes: medicine.notes || null,
        })
      );

      const results = await Promise.all(savePromises);
      console.log("Medicines saved successfully:", results);

      toast.success("Medicines saved successfully", {
        description: `${medicinesToSave.length} medicine(s) saved to database`,
      });
    } catch (error) {
      console.error("Error saving medicines:", error);
      toast.error("Failed to save some medicines", {
        description: "Please check and save them manually",
      });
      throw error; // Re-throw to stop the upload process
    }
  };

  const handleProcessing = async (file: File) => {
    setCurrentState("loading");
    try {
      const parsedMedicines = await parsePrescription(file);
      await uploadPrescription(file, parsedMedicines);
      setCurrentState("processed");
    } catch (error) {
      console.error("Error processing prescription:", error);
      setCurrentState("error");
    }
  };

  const handleDrop = (files: File[]) => {
    setFiles(files);
    handleProcessing(files[0]);
  };

  return (
    <Dropzone
      accept={{ "image/png": [], "image/jpeg": [], "image/jpg": [] }}
      maxFiles={1}
      maxSize={1024 * 1024 * 5}
      minSize={0}
      onDrop={handleDrop}
      onError={console.error}
      src={files}
      className="h-full bg-blue-100 border-dashed border-2 border-blue-300 rounded-lg"
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
};

export default FileUploader;
