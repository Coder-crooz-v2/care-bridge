import { usePrescriptionList } from "@/store/usePrescriptionList";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MedicineCard from "./MedicineCard";
import CalendarSection from "./CalendarSection";
import Disclaimer from "./Disclaimer";
import { Medicine } from "@/types/prescription";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

const DisplayMedicines = () => {
  const { medicines, setMedicines, prescriptionList } = usePrescriptionList();
  const [prescriptionTitle, setPrescriptionTitle] = useState(
    "Sample Prescription"
  );
  const searchParams = useSearchParams();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(prescriptionTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setCurrentPrescriptionId(id);
      const prescription = prescriptionList.find((p) => p.id === id);
      if (prescription) {
        setPrescriptionTitle(prescription.title || "Untitled Prescription");
        setEditedTitle(prescription.title || "Untitled Prescription");
      }
      // Fetch medicines for this prescription
      fetchMedicines(id);
    } else {
      setCurrentPrescriptionId(null);
      setPrescriptionTitle("Sample Prescription");
      setEditedTitle("Sample Prescription");
      setMedicines([]); // Clear medicines when no prescription is selected
    }
  }, [searchParams, prescriptionList]);

  const fetchMedicines = async (prescriptionId: string) => {
    try {
      const response = await axios.get(`/api/medicines?id=${prescriptionId}`);
      if (response.status === 200) {
        setMedicines(response.data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines. Please try again.");
    }
  };

  const handleTitleSave = async () => {
    if (!currentPrescriptionId) {
      toast.error("No prescription selected");
      return;
    }

    setIsSavingTitle(true);
    try {
      const response = await axios.patch("/api/prescriptions", {
        id: currentPrescriptionId,
        title: editedTitle,
      });

      if (response.status === 200) {
        setPrescriptionTitle(editedTitle);
        setIsEditingTitle(false);
        toast.success("Prescription title updated successfully");
      }
    } catch (error) {
      console.error("Error updating prescription title:", error);
      toast.error("Failed to update prescription title. Please try again.");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setEditedTitle(prescriptionTitle);
    setIsEditingTitle(false);
  };

  const handleMedicineSave = (index: number, updatedMedicine: Medicine) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = updatedMedicine;
    setMedicines(updatedMedicines);
  };

  const handleMedicineDelete = (medicineId: string) => {
    const updatedMedicines = medicines.filter((med) => med.id !== medicineId);
    setMedicines(updatedMedicines);
  };

  return (
    <div className="w-full h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] p-6 flex flex-col overflow-hidden">
      {/* Prescription Title */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        {isEditingTitle ? (
          <div className="flex items-center gap-4 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-2xl font-bold"
            />
            <Button onClick={handleTitleSave} disabled={isSavingTitle}>
              {isSavingTitle ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleTitleCancel}
              variant="outline"
              disabled={isSavingTitle}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">{prescriptionTitle}</h1>
            <Button onClick={() => setIsEditingTitle(true)}>Edit</Button>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Section: Medicine List */}
        <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle>Medicines</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden p-0 px-6 pb-6">
              <div className="h-full overflow-y-auto pr-2 space-y-4">
                {medicines.length > 0 ? (
                  medicines.map((medicine, index) => (
                    <MedicineCard
                      key={medicine.id || index}
                      medicine={medicine}
                      onSave={(updated) => handleMedicineSave(index, updated)}
                      onDelete={handleMedicineDelete}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-gray-500">
                      No medicines to display
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 min-h-0 overflow-hidden">
          <div className="flex-shrink-0">
            <CalendarSection />
          </div>
          {/* <div className="flex-shrink-0">
            <Disclaimer />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DisplayMedicines;
