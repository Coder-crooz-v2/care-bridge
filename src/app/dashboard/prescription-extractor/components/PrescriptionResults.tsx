"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Pill,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { PrescriptionData } from "@/types/prescription";

interface PrescriptionResultsProps {
  data: PrescriptionData;
}

export default function PrescriptionResults({
  data,
}: PrescriptionResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Prescription Decoded Successfully
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {data.total_medicines}{" "}
              {data.total_medicines === 1 ? "Medicine" : "Medicines"} Found
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Medicine Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Medicine Details
        </h3>

        <div className="grid gap-4">
          {data.medicine_dosage_details.map((medicine, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Medicine Name */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        {medicine.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30"
                      >
                        #{index + 1}
                      </Badge>
                    </div>

                    {/* Medicine Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Dosage */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          Dosage
                        </div>
                        <p className="text-sm text-foreground font-medium bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded">
                          {medicine.dosage}
                        </p>
                      </div>

                      {/* Frequency */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Frequency
                        </div>
                        <p className="text-sm text-foreground font-medium bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                          {medicine.frequency}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Duration
                        </div>
                        <p className="text-sm text-foreground font-medium bg-purple-50 dark:bg-purple-950/20 px-2 py-1 rounded">
                          {medicine.duration}
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                          <Info className="h-3 w-3" />
                          Instructions
                        </div>
                        <p className="text-sm text-foreground font-medium bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded">
                          {medicine.instructions}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {medicine.notes && (
                      <div className="pt-2">
                        <Separator className="mb-3" />
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                              Important Note:
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              {medicine.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      {data.disclaimer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Medical Disclaimer
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                    {data.disclaimer}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
