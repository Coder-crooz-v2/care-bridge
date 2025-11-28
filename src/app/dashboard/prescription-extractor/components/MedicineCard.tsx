import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  onCardClick?: (medicine: Medicine) => void;
  onReminderCancelled?: (medicineId: string) => void;
}

const MedicineCard = ({
  medicine,
  onSave,
  onDelete,
  onCardClick,
  onReminderCancelled,
}: MedicineCardProps) => {
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
        if (onReminderCancelled) {
          onReminderCancelled(medicine.id);
        }
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

  const handleCardClick = () => {
    if (!isEditing && onCardClick && hasActiveReminder) {
      onCardClick(medicine);
    }
  };

  return (
    <Card
      className={`mb-3 sm:mb-4 bg-gradient-to-br to-blue-50 from-neutral-100 border-blue-200 ${
        !isEditing && hasActiveReminder
          ? "cursor-pointer hover:shadow-lg transition-shadow"
          : ""
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-blue-900 w-full sm:w-auto">
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
              className="bg-white text-sm sm:text-base"
            />
          ) : (
            medicine.medicine
          )}
        </CardTitle>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          {hasActiveReminder ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelReminder();
              }}
              disabled={isCancelingReminder || isEditing}
              className="gap-1 sm:gap-2 bg-white hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <BellOff className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isCancelingReminder ? "Canceling..." : "Cancel Reminder"}</span>
              <span className="sm:hidden">Cancel</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSetReminder();
              }}
              disabled={isSettingReminder || isEditing || isCheckingReminder}
              className="gap-1 sm:gap-2 bg-white hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isSettingReminder ? "Setting..." : "Set Reminder"}</span>
              <span className="sm:hidden">Set</span>
            </Button>
          )}
          {isEditing ? (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                size="sm"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                variant="outline"
                size="sm"
                disabled={isSaving}
                className="bg-white hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 py-2 sm:py-3 px-4 sm:px-6">
        {/* First Row: Dosage, Timing, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-blue-800 font-medium text-xs sm:text-sm">Dosage</Label>
            {isEditing ? (
              <Input
                value={editedMedicine.dosage || ""}
                onChange={(e) =>
                  setEditedMedicine({
                    ...editedMedicine,
                    dosage: e.target.value,
                  })
                }
                placeholder="Dosage"
                className="mt-1 bg-white text-sm"
              />
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-gray-700">
                {medicine.dosage || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <Label className="text-blue-800 font-medium text-xs sm:text-sm">Timing</Label>
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning"
                    checked={editedMedicine.morning || false}
                    onCheckedChange={(checked: boolean) => {
                      setEditedMedicine({
                        ...editedMedicine,
                        morning: checked === true,
                      });
                    }}
                  />
                  <Label htmlFor="morning" className="cursor-pointer text-xs sm:text-sm">
                    Morning
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noon"
                    checked={editedMedicine.noon || false}
                    onCheckedChange={(checked: boolean) => {
                      setEditedMedicine({
                        ...editedMedicine,
                        noon: checked === true,
                      });
                    }}
                  />
                  <Label htmlFor="noon" className="cursor-pointer text-xs sm:text-sm">
                    Noon
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="night"
                    checked={editedMedicine.night || false}
                    onCheckedChange={(checked: boolean) => {
                      setEditedMedicine({
                        ...editedMedicine,
                        night: checked === true,
                      });
                    }}
                  />
                  <Label htmlFor="night" className="cursor-pointer text-xs sm:text-sm">
                    Night
                  </Label>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-gray-700">
                {medicine.morning && "Morning "}
                {medicine.noon && "Noon "}
                {medicine.night && "Night"}
                {!medicine.morning &&
                  !medicine.noon &&
                  !medicine.night &&
                  "Not set"}
              </p>
            )}
          </div>
          <div>
            <Label className="text-blue-800 font-medium text-xs sm:text-sm">
              Duration
            </Label>
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
                className="mt-1 bg-white text-sm"
              />
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-gray-700">
                {medicine.duration || 1} days
              </p>
            )}
          </div>
        </div>

        {/* Second Row: Instructions and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-blue-800 font-medium text-xs sm:text-sm">
              Instructions
            </Label>
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
                className="mt-1 bg-white text-sm"
              />
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-gray-700">
                {medicine.instructions || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <Label className="text-blue-800 font-medium text-xs sm:text-sm">Notes</Label>
            {isEditing ? (
              <Input
                value={editedMedicine.notes || ""}
                onChange={(e) =>
                  setEditedMedicine({
                    ...editedMedicine,
                    notes: e.target.value,
                  })
                }
                placeholder="Notes"
                className="mt-1 bg-white text-sm"
              />
            ) : (
              <p className="mt-1 text-xs sm:text-sm text-gray-700">
                {medicine.notes || "No notes"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;
