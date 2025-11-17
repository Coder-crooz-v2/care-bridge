import { Medicine, PrescriptionList } from "@/types/prescription";
import { create } from "zustand";

interface PrescriptionListState {
  prescriptionList: PrescriptionList[];
  medicines: Medicine[];
  setPrescriptionList: (prescriptionList: PrescriptionList[]) => void;
  setMedicines: (medicines: Medicine[]) => void;
}

export const usePrescriptionList = create<PrescriptionListState>((set) => ({
  prescriptionList: [],
  setPrescriptionList: (prescriptionList) => set({ prescriptionList }),
  medicines: [],
  setMedicines: (medicines) => set({ medicines }),
}));
