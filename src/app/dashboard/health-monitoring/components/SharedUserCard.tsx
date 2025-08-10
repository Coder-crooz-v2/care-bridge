"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
} from "lucide-react";
import { SharedUser } from "@/types/health";

interface SharedUserCardProps {
  sharedUser: SharedUser;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onMarkAttended: () => void;
}

const SharedUserCard: React.FC<SharedUserCardProps> = ({
  sharedUser,
  isExpanded,
  onToggleExpanded,
  onMarkAttended,
}) => {
  const getStatusColor = (needsAttention: boolean, isAttended: boolean) => {
    if (isAttended) return "text-green-600";
    if (needsAttention) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusIcon = (needsAttention: boolean, isAttended: boolean) => {
    if (isAttended) return <CheckCircle className="h-4 w-4" />;
    if (needsAttention) return <AlertTriangle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getStatusText = (needsAttention: boolean, isAttended: boolean) => {
    if (isAttended) return "Attended";
    if (needsAttention) return "Needs Attention";
    return "Normal";
  };

  return (
    <Card
      className={`transition-colors ${
        sharedUser.needs_attention && !sharedUser.is_attended
          ? "border-red-200 bg-red-50"
          : ""
      }`}
    >
      <CardHeader>
        <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{sharedUser.user_email}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className={`flex items-center space-x-1 ${getStatusColor(
                        sharedUser.needs_attention,
                        sharedUser.is_attended
                      )}`}
                    >
                      {getStatusIcon(
                        sharedUser.needs_attention,
                        sharedUser.is_attended
                      )}
                      <span className="text-sm font-medium">
                        {getStatusText(
                          sharedUser.needs_attention,
                          sharedUser.is_attended
                        )}
                      </span>
                    </div>
                    {sharedUser.latest_data && (
                      <Badge variant="outline" className="text-xs">
                        Last update:{" "}
                        {new Date(
                          sharedUser.latest_data.vitals.timestamp
                        ).toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {sharedUser.needs_attention && !sharedUser.is_attended && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAttended();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Attended
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {sharedUser.latest_data ? (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Heart Rate
                      </p>
                      <p className="text-xl font-bold">
                        {sharedUser.latest_data.vitals.heart_rate}
                      </p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Droplets className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SpO2</p>
                      <p className="text-xl font-bold">
                        {sharedUser.latest_data.vitals.spo2}
                      </p>
                      <p className="text-xs text-muted-foreground">%</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Blood Pressure
                      </p>
                      <p className="text-xl font-bold">
                        {sharedUser.latest_data.vitals.blood_pressure_systolic}/
                        {sharedUser.latest_data.vitals.blood_pressure_diastolic}
                      </p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Temperature
                      </p>
                      <p className="text-xl font-bold">
                        {sharedUser.latest_data.vitals.temperature}
                      </p>
                      <p className="text-xs text-muted-foreground">°F</p>
                    </div>
                  </div>
                </div>

                {sharedUser.latest_data.analysis && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Analysis</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Status:</strong>{" "}
                        {sharedUser.latest_data.analysis.status}
                      </p>
                      {sharedUser.latest_data.analysis.concerns &&
                        sharedUser.latest_data.analysis.concerns.length > 0 && (
                          <div className="mt-2">
                            <p>
                              <strong>Concerns:</strong>
                            </p>
                            <ul className="list-disc list-inside ml-2">
                              {sharedUser.latest_data.analysis.concerns.map(
                                (concern, index) => (
                                  <li key={index}>{concern}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {sharedUser.latest_data.analysis.recommendations &&
                        sharedUser.latest_data.analysis.recommendations.length >
                          0 && (
                          <div className="mt-2">
                            <p>
                              <strong>Recommendations:</strong>
                            </p>
                            <ul className="list-disc list-inside ml-2">
                              {sharedUser.latest_data.analysis.recommendations.map(
                                (rec, index) => (
                                  <li key={index}>{rec}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent className="pt-4">
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent health data available</p>
                </div>
              </CardContent>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default SharedUserCard;
