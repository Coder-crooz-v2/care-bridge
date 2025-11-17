import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { Medicine } from "@/types/prescription";
import { toast } from "sonner";
import axios from "axios";
import { Trash2, Bell, BellOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import {
  scheduleReminder,
  cancelReminder,
  checkReminderStatus,
} from "@/lib/reminder-service";

interface MedicineCardProps {
  medicine: Medicine;
  onSave: (updatedMedicine: Medicine) => void;
  onDelete: (medicineId: string) => void;
}

const MedicineCard = ({ medicine, onSave, onDelete }: MedicineCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedicine, setEditedMedicine] = useState(medicine);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [isCancelingReminder, setIsCancelingReminder] = useState(false);
  const [hasActiveReminder, setHasActiveReminder] = useState(false);
  const [isCheckingReminder, setIsCheckingReminder] = useState(false);
  const { user } = useAuthStore();

  // Check reminder status on mount and when medicine changes
  useEffect(() => {
    checkReminder();
  }, [medicine.id]);

  const checkReminder = async () => {
    setIsCheckingReminder(true);
    try {
      const status = await checkReminderStatus(medicine.id);
      setHasActiveReminder(status.hasActiveReminder);
    } catch (error) {
      console.error("Error checking reminder status:", error);
    } finally {
      setIsCheckingReminder(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.patch("/api/medicines", {
        id: editedMedicine.id,
        medicine: editedMedicine.medicine || "",
        dosage: editedMedicine.dosage || null,
        duration: editedMedicine.duration || 1,
        morning: editedMedicine.morning || false,
        noon: editedMedicine.noon || false,
        night: editedMedicine.night || false,
        instructions: editedMedicine.instructions || null,
        notes: editedMedicine.notes || null,
      });

      if (response.status === 200) {
        onSave(response.data);
        setEditedMedicine(response.data);
        setIsEditing(false);
        toast.success("Medicine updated successfully");
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      toast.error("Failed to update medicine. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (medicine.id) {
        await axios.delete(`/api/medicines?id=${medicine.id}`);
        toast.success("Medicine deleted successfully");
      }
      onDelete(medicine.id);
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast.error("Failed to delete medicine. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedMedicine(medicine);
    setIsEditing(false);
  };

  const handleSetReminder = async () => {
    if (!user?.id) {
      toast.error("User not found. Please log in again.");
      return;
    }

    // Check if at least one time slot is selected
    if (!medicine.morning && !medicine.noon && !medicine.night) {
      toast.error(
        "Please select at least one time slot (morning, noon, or night) before setting a reminder."
      );
      return;
    }

    setIsSettingReminder(true);
    try {
      const response = await scheduleReminder({
        medicine_id: medicine.id,
        user_id: user.id,
        duration: medicine.duration,
        morning: medicine.morning,
        noon: medicine.noon,
        night: medicine.night,
      });

      if (response.success) {
        toast.success(response.message);
        setHasActiveReminder(true);
      } else {
        toast.error("Failed to set reminder. Please try again.");
      }
    } catch (error) {
      console.error("Error setting reminder:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to set reminder. Please try again.");
      }
    } finally {
      setIsSettingReminder(false);
    }
  };

  const handleCancelReminder = async () => {
    setIsCancelingReminder(true);
    try {
      const response = await cancelReminder(medicine.id);

      if (response.success) {
        toast.success("Reminder cancelled successfully");
        setHasActiveReminder(false);
      } else {
        toast.error("Failed to cancel reminder. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling reminder:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to cancel reminder. Please try again.");
      }
    } finally {
      setIsCancelingReminder(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {isEditing ? (
            <Input
              value={editedMedicine.medicine}
              onChange={(e) =>
                setEditedMedicine({
                  ...editedMedicine,
                  medicine: e.target.value,
                })
              }
              placeholder="Medicine name"
            />
          ) : (
            medicine.medicine
          )}
        </CardTitle>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {hasActiveReminder ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelReminder}
              disabled={isCancelingReminder || isEditing}
              className="gap-2"
            >
              <BellOff className="h-4 w-4" />
              {isCancelingReminder ? "Canceling..." : "Cancel Reminder"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetReminder}
              disabled={isSettingReminder || isEditing || isCheckingReminder}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              {isSettingReminder ? "Setting..." : "Set Reminder"}
            </Button>
          )}
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Dosage</Label>
          {isEditing ? (
            <Input
              value={editedMedicine.dosage || ""}
              onChange={(e) =>
                setEditedMedicine({ ...editedMedicine, dosage: e.target.value })
              }
              placeholder="Dosage"
            />
          ) : (
            <p>{medicine.dosage || "Not specified"}</p>
          )}
        </div>
        <div>
          <Label>Timing</Label>
          {isEditing ? (
            <RadioGroup
              value={
                editedMedicine.morning
                  ? "morning"
                  : editedMedicine.noon
                  ? "noon"
                  : editedMedicine.night
                  ? "night"
                  : ""
              }
              onValueChange={(value) => {
                setEditedMedicine({
                  ...editedMedicine,
                  morning: value === "morning",
                  noon: value === "noon",
                  night: value === "night",
                });
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning">Morning</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noon" id="noon" />
                <Label htmlFor="noon">Noon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="night" id="night" />
                <Label htmlFor="night">Night</Label>
              </div>
            </RadioGroup>
          ) : (
            <p>
              {medicine.morning && "Morning "}
              {medicine.noon && "Noon "}
              {medicine.night && "Night"}
            </p>
          )}
        </div>
        <div>
          <Label>Duration (days)</Label>
          {isEditing ? (
            <Input
              type="number"
              value={editedMedicine.duration || 1}
              onChange={(e) =>
                setEditedMedicine({
                  ...editedMedicine,
                  duration: parseInt(e.target.value) || 1,
                })
              }
              placeholder="Duration"
              min="1"
            />
          ) : (
            <p>{medicine.duration || 1} days</p>
          )}
        </div>
        <div>
          <Label>Instructions</Label>
          {isEditing ? (
            <Input
              value={editedMedicine.instructions || ""}
              onChange={(e) =>
                setEditedMedicine({
                  ...editedMedicine,
                  instructions: e.target.value,
                })
              }
              placeholder="Instructions"
            />
          ) : (
            <p>{medicine.instructions || "Not specified"}</p>
          )}
        </div>
        <div>
          <Label>Notes</Label>
          {isEditing ? (
            <Input
              value={editedMedicine.notes || ""}
              onChange={(e) =>
                setEditedMedicine({ ...editedMedicine, notes: e.target.value })
              }
              placeholder="Notes"
            />
          ) : (
            <p>{medicine.notes || "No notes"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;
