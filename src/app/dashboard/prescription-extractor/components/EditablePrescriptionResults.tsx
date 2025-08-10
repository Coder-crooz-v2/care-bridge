"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Users,
  Activity,
} from "lucide-react";
import { MedicineDetail } from "@/types/prescription";
import { toast } from "sonner";

interface EditablePrescriptionResultsProps {
  medicines: MedicineDetail[];
  onMedicinesUpdate: (medicines: MedicineDetail[]) => void;
}

const EditablePrescriptionResults: React.FC<
  EditablePrescriptionResultsProps
> = ({ medicines, onMedicinesUpdate }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [tempMedicine, setTempMedicine] = useState<MedicineDetail | null>(null);

  const toggleCardExpanded = useCallback((index: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const startEditing = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setTempMedicine({ ...medicines[index] });
    },
    [medicines]
  );

  const saveChanges = useCallback(() => {
    if (editingIndex !== null && tempMedicine) {
      const updatedMedicines = [...medicines];
      updatedMedicines[editingIndex] = tempMedicine;
      onMedicinesUpdate(updatedMedicines);
      setEditingIndex(null);
      setTempMedicine(null);
      toast.success("Medicine details updated successfully");
    }
  }, [editingIndex, tempMedicine, medicines, onMedicinesUpdate]);

  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setTempMedicine(null);
  }, []);

  const deleteMedicine = useCallback(
    (index: number) => {
      const updatedMedicines = medicines.filter((_, i) => i !== index);
      onMedicinesUpdate(updatedMedicines);
      toast.success("Medicine removed successfully");
    },
    [medicines, onMedicinesUpdate]
  );

  const addNewMedicine = useCallback(() => {
    const newMedicine: MedicineDetail = {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      notes: "",
      generic_name: "",
      category: "",
      purpose: "",
      avoid_groups: [],
      side_effects: [],
      warnings: [],
      interactions: [],
      precautions: [],
      contraindications: [],
    };

    const updatedMedicines = [...medicines, newMedicine];
    onMedicinesUpdate(updatedMedicines);
    setEditingIndex(updatedMedicines.length - 1);
    setTempMedicine(newMedicine);
    toast.success("New medicine slot added");
  }, [medicines, onMedicinesUpdate]);

  const updateTempMedicine = useCallback(
    (field: keyof MedicineDetail, value: string | string[]) => {
      if (tempMedicine) {
        setTempMedicine((prev) => ({
          ...prev!,
          [field]: value,
        }));
      }
    },
    [tempMedicine]
  );

  const updateArrayField = useCallback(
    (field: keyof MedicineDetail, value: string) => {
      if (tempMedicine) {
        const arrayValue = value
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        updateTempMedicine(field, arrayValue);
      }
    },
    [tempMedicine, updateTempMedicine]
  );

  if (!medicines || medicines.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed">
        <div className="text-center p-8">
          <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">
            No prescription decoded yet
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload and process a prescription to see results here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4">
        <div>
          <h3 className="text-lg font-semibold">Prescription Results</h3>
          <p className="text-sm text-muted-foreground">
            {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}{" "}
            detected
          </p>
        </div>
        <Button
          onClick={addNewMedicine}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {medicines.map((medicine, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">
                  {editingIndex === index ? (
                    <Input
                      value={tempMedicine?.name || ""}
                      onChange={(e) =>
                        updateTempMedicine("name", e.target.value)
                      }
                      placeholder="Medicine name"
                      className="w-64"
                    />
                  ) : (
                    medicine.name || "Unnamed Medicine"
                  )}
                </CardTitle>
                {medicine.category && (
                  <Badge variant="secondary" className="text-xs">
                    {medicine.category}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleCardExpanded(index)}
                  className="h-8 w-8"
                >
                  {expandedCards.has(index) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {editingIndex === index ? (
                  <>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={saveChanges}
                      className="h-8 w-8"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditing}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(index)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMedicine(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Dosage
                </label>
                {editingIndex === index ? (
                  <Input
                    value={tempMedicine?.dosage || ""}
                    onChange={(e) =>
                      updateTempMedicine("dosage", e.target.value)
                    }
                    placeholder="e.g., 500mg"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {medicine.dosage || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Frequency
                </label>
                {editingIndex === index ? (
                  <Input
                    value={tempMedicine?.frequency || ""}
                    onChange={(e) =>
                      updateTempMedicine("frequency", e.target.value)
                    }
                    placeholder="e.g., 3 times daily"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {medicine.frequency || "As directed"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Duration
                </label>
                {editingIndex === index ? (
                  <Input
                    value={tempMedicine?.duration || ""}
                    onChange={(e) =>
                      updateTempMedicine("duration", e.target.value)
                    }
                    placeholder="e.g., 7 days"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {medicine.duration || "As prescribed"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Generic Name
                </label>
                {editingIndex === index ? (
                  <Input
                    value={tempMedicine?.generic_name || ""}
                    onChange={(e) =>
                      updateTempMedicine("generic_name", e.target.value)
                    }
                    placeholder="Generic name"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {medicine.generic_name || "Not available"}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground">
                Instructions
              </label>
              {editingIndex === index ? (
                <Textarea
                  value={tempMedicine?.instructions || ""}
                  onChange={(e) =>
                    updateTempMedicine("instructions", e.target.value)
                  }
                  placeholder="Taking instructions"
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">
                  {medicine.instructions || "Follow doctor's advice"}
                </p>
              )}
            </div>

            {/* Expanded Content */}
            <Collapsible open={expandedCards.has(index)}>
              <CollapsibleContent className="space-y-4">
                {/* Purpose */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Purpose
                    </label>
                  </div>
                  {editingIndex === index ? (
                    <Textarea
                      value={tempMedicine?.purpose || ""}
                      onChange={(e) =>
                        updateTempMedicine("purpose", e.target.value)
                      }
                      placeholder="Why this medicine is prescribed"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {medicine.purpose ||
                        "Consult your doctor for information about this medication"}
                    </p>
                  )}
                </div>

                {/* Avoid Groups */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Who Should Avoid
                    </label>
                  </div>
                  {editingIndex === index ? (
                    <Textarea
                      value={tempMedicine?.avoid_groups?.join(", ") || ""}
                      onChange={(e) =>
                        updateArrayField("avoid_groups", e.target.value)
                      }
                      placeholder="Groups who should avoid (comma separated)"
                      rows={2}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {medicine.avoid_groups &&
                      medicine.avoid_groups.length > 0 ? (
                        medicine.avoid_groups.map((group, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {group}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Consult healthcare provider
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Warnings */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Warnings
                    </label>
                  </div>
                  {editingIndex === index ? (
                    <Textarea
                      value={tempMedicine?.warnings?.join(", ") || ""}
                      onChange={(e) =>
                        updateArrayField("warnings", e.target.value)
                      }
                      placeholder="Important warnings (comma separated)"
                      rows={2}
                    />
                  ) : (
                    <div className="space-y-1">
                      {medicine.warnings && medicine.warnings.length > 0 ? (
                        medicine.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {warning}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Always follow your doctor's instructions
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </label>
                  {editingIndex === index ? (
                    <Textarea
                      value={tempMedicine?.notes || ""}
                      onChange={(e) =>
                        updateTempMedicine("notes", e.target.value)
                      }
                      placeholder="Additional notes"
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {medicine.notes || "No additional notes"}
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EditablePrescriptionResults;
