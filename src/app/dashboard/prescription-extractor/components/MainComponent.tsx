"use client";
import { FrownIcon, StethoscopeIcon } from "lucide-react";
import FileUploader from "./FileUploader";
import LoadingOverlay from "../../../../components/LoadingOverlay";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DisplayMedicines from "./DisplayMedicines";

const MainComponent = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [currentState, setCurrentState] = useState<
    "upload" | "processed" | "loading" | "error"
  >("loading");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setPrescriptionId(id);
      setCurrentState("processed");
    } else {
      console.log("No prescription ID found in URL parameters.");
      setCurrentState("upload");
    }
  }, [searchParams]);

  const renderCurrentState = () => {
    switch (currentState) {
      case "upload":
        return (
          <div className="bg-blue-100 border-2 border-blue-300 w-full sm:w-5/6 md:w-2/3 h-64 sm:h-80 md:h-96 p-4 sm:p-6 rounded-lg">
            <FileUploader
              files={files}
              setFiles={setFiles}
              setCurrentState={setCurrentState}
              setError={setError}
            />
          </div>
        );
      case "loading":
        return <LoadingOverlay />;
      case "processed":
        return <DisplayMedicines />;
      case "error":
        return (
          <div className="space-y-4 text-primary font-bold text-base sm:text-lg md:text-xl w-full justify-center items-center flex flex-col px-4">
            <FrownIcon size={48} className="w-10 h-10 sm:w-12 sm:h-12" />
            <p className="text-center">
              {" "}
              Oh no! Seems like we encountered an error while processing your
              prescription.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-3 sm:p-4 flex flex-row items-center justify-start border-b w-full gap-2 sm:gap-4">
        <StethoscopeIcon className="text-primary w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 p-2 rounded" />
        <h1 className="text-xl sm:text-2xl font-bold">
          Prescription Extractor
        </h1>
      </div>
      <div className="flex flex-col p-4 sm:p-6 items-center justify-center h-full w-full">
        {renderCurrentState()}
      </div>
    </div>
  );
};

export default MainComponent;
