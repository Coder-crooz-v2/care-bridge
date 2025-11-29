"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { createClient } from "@/utils/supabase/client";

interface AddMedicineDialogProps {
  prescriptionId: string | null;
  onMedicineAdded: () => void;
}

const AddMedicineDialog = ({
  prescriptionId,
  onMedicineAdded,
}: AddMedicineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicine: "",
    dosage: "",
    instructions: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prescriptionId) {
      toast.error(
        "No prescription selected. Please upload a prescription first."
      );
      return;
    }

    if (!formData.medicine.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to add medicines");
        setLoading(false);
        return;
      }

      const response = await axios.post("/api/medicines", {
        user_id: user.id,
        prescription_id: prescriptionId,
        medicine: formData.medicine.trim(),
        dosage: formData.dosage.trim() || null,
        instructions: formData.instructions.trim() || null,
        notes: formData.notes.trim() || null,
      });

      if (response.status === 200) {
        toast.success("Medicine added successfully");
        setFormData({
          medicine: "",
          dosage: "",
          instructions: "",
          notes: "",
        });
        setOpen(false);
        onMedicineAdded();
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Failed to add medicine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      medicine: "",
      dosage: "",
      instructions: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 text-sm sm:text-base"
          disabled={!prescriptionId}
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Medicine Manually</DialogTitle>
          <DialogDescription>
            Enter the medicine details to add it to your prescription.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicine">
                Medicine Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medicine"
                name="medicine"
                placeholder="e.g., Paracetamol"
                value={formData.medicine}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                name="dosage"
                placeholder="e.g., 500mg"
                value={formData.dosage}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="e.g., Take after meals"
                value={formData.instructions}
                onChange={handleInputChange}
                disabled={loading}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={loading}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Add Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicineDialog;
