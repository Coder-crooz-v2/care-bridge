"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Users,
  Share2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Bell,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuth";
import { HealthMonitoringService } from "@/lib/health-monitoring-service";
import {
  HealthData,
  SharedUser,
  ShareHealthRequest,
  UserHealthProfile,
  HealthAnalysis,
} from "@/types/health";
import VitalsChart from "./VitalsChart";
import SharedUserCard from "./SharedUserCard";
import PeriodTracker from "./PeriodTracker";

const HealthMonitoringComponent = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentHealthData, setCurrentHealthData] = useState<HealthData | null>(
    null
  );
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [sharingList, setSharingList] = useState<
    Array<{ id: string; viewer_email: string; created_at: string }>
  >([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [healthProfile, setHealthProfile] = useState<UserHealthProfile | null>(
    null
  );
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user health profile
  useEffect(() => {
    if (user && mounted) {
      loadHealthProfile();
    }
  }, [user, mounted]);

  // Connect to WebSocket when user is available
  useEffect(() => {
    if (user && mounted && healthProfile) {
      connectToHealthMonitoring();
      loadSharedUsers();
      loadSharingList(); // Load the list of users we're sharing with
    }

    return () => {
      HealthMonitoringService.disconnectWebSocket();
    };
  }, [user, mounted, healthProfile]);

  const loadHealthProfile = async () => {
    if (!user) return;

    const response = await HealthMonitoringService.getHealthProfile(user.id);
    if (response.success && response.data) {
      setHealthProfile(response.data);
    } else {
      // Create default profile
      const defaultProfile: UserHealthProfile = {
        user_id: user.id,
        is_female: false,
        notification_preferences: {
          email_alerts: true,
          sms_alerts: false,
          push_notifications: true,
        },
      };
      setHealthProfile(defaultProfile);
      await HealthMonitoringService.updateHealthProfile(defaultProfile);
    }
  };

  const connectToHealthMonitoring = async () => {
    if (!user || !user.email || !healthProfile) return;

    try {
      const ws = await HealthMonitoringService.connectWebSocket(
        user.id,
        user.email,
        healthProfile.is_female
      );

      setIsConnected(true);

      // Handle real-time health data
      HealthMonitoringService.addMessageHandler(
        "health_data",
        (data: HealthData) => {
          setCurrentHealthData(data);

          // Add to vitals history for chart
          setVitalsHistory((prev) => {
            const newHistory = [
              ...prev,
              {
                timestamp: data.vitals.timestamp,
                heart_rate: data.vitals.heart_rate,
                spo2: data.vitals.spo2,
                temperature: data.vitals.temperature,
                blood_pressure: `${data.vitals.blood_pressure_systolic}/${data.vitals.blood_pressure_diastolic}`,
              },
            ];

            // Keep only last 60 readings (10 minutes)
            return newHistory.slice(-60);
          });

          // Show alert if needs attention
          if (data.needs_attention && !data.is_attended) {
            toast.error("Health Alert", {
              description:
                "Your vitals indicate you need attention. Consider seeking medical help.",
            });
          }
        }
      );

      // Handle shared health data
      HealthMonitoringService.addMessageHandler(
        "shared_health_data",
        (data: HealthData) => {
          setSharedUsers((prev) =>
            prev.map((user) =>
              user.user_id === data.user_id
                ? {
                    ...user,
                    latest_data: data,
                    needs_attention: data.needs_attention,
                    is_attended: data.is_attended,
                  }
                : user
            )
          );
        }
      );

      toast.success("Connected to health monitoring system");
    } catch (error) {
      console.error("Failed to connect to health monitoring:", error);
      toast.error("Failed to connect to health monitoring system");
    }
  };

  const loadSharedUsers = async () => {
    if (!user) return;

    try {
      const response = await HealthMonitoringService.getSharedUsers(user.id);
      if (response.success && response.data) {
        setSharedUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        setSharedUsers([]);
      }
    } catch (error) {
      console.error("Error loading shared users:", error);
      setSharedUsers([]);
    }
  };

  const loadSharingList = async () => {
    if (!user) return;

    const response = await HealthMonitoringService.getSharingList();
    if (response.success && response.data) {
      setSharingList(response.data);
    }
  };

  const handleStopSharing = async (targetEmail: string) => {
    try {
      const response = await HealthMonitoringService.stopSharing(targetEmail);
      if (response.success) {
        toast.success(`Stopped sharing with ${targetEmail}`);
        loadSharingList(); // Refresh the sharing list
      } else {
        toast.error(response.error || "Failed to stop sharing");
      }
    } catch (error) {
      console.error("Failed to stop sharing:", error);
      toast.error("Failed to stop sharing");
    }
  };

  const handleShareHealth = async () => {
    if (!user || !user.email || !shareEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (shareEmail === user.email) {
      toast.error("You cannot share health data with yourself");
      return;
    }

    setIsSharing(true);

    try {
      const request: ShareHealthRequest = {
        sharer_email: user.email,
        targetEmail: shareEmail.trim(),
        user_id: user.id,
      };

      const response = await HealthMonitoringService.shareHealthData(request);

      if (response.success) {
        toast.success(`Health data sharing enabled with ${shareEmail}`);
        setShareEmail("");
        loadSharingList(); // Refresh the sharing list
      } else {
        toast.error(response.error || "Failed to share health data");
      }
    } catch (error) {
      toast.error("Failed to share health data");
    } finally {
      setIsSharing(false);
    }
  };

  const toggleUserExpanded = useCallback((userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const handleMarkAttended = async (userId: string) => {
    if (!user) return;

    const response = await HealthMonitoringService.markAttended({
      user_id: userId,
      attended_by: user.id,
    });

    if (response.success) {
      toast.success("User marked as attended");
      // Update local state
      setSharedUsers((prev) =>
        prev.map((sharedUser) =>
          sharedUser.user_id === userId
            ? { ...sharedUser, is_attended: true, needs_attention: false }
            : sharedUser
        )
      );
    } else {
      toast.error("Failed to mark as attended");
    }
  };

  const updateHealthProfile = async (updates: Partial<UserHealthProfile>) => {
    if (!healthProfile) return;

    const updatedProfile = { ...healthProfile, ...updates };
    setHealthProfile(updatedProfile);

    const response = await HealthMonitoringService.updateHealthProfile(
      updatedProfile
    );
    if (response.success) {
      toast.success("Health profile updated");
    } else {
      toast.error("Failed to update health profile");
    }
  };

  const getVitalStatus = (
    value: number,
    type: "heart_rate" | "spo2" | "bp_systolic" | "bp_diastolic" | "temperature"
  ) => {
    const ranges = {
      heart_rate: { min: 60, max: 100 },
      spo2: { min: 95, max: 100 },
      bp_systolic: { min: 90, max: 140 },
      bp_diastolic: { min: 60, max: 90 },
      temperature: { min: 97.0, max: 99.0 },
    };

    const range = ranges[type];
    if (value < range.min || value > range.max) {
      return "abnormal";
    }
    return "normal";
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Please log in to access health monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time health tracking and sharing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Health Profile Settings</DialogTitle>
                <DialogDescription>
                  Configure your health monitoring preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_female"
                    checked={healthProfile?.is_female || false}
                    onChange={(e) =>
                      updateHealthProfile({ is_female: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_female" className="text-sm font-medium">
                    Enable period tracking (females only)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email_alerts"
                    checked={
                      healthProfile?.notification_preferences?.email_alerts ||
                      false
                    }
                    onChange={(e) =>
                      updateHealthProfile({
                        notification_preferences: {
                          email_alerts: e.target.checked,
                          sms_alerts:
                            healthProfile?.notification_preferences
                              ?.sms_alerts ?? false,
                          push_notifications:
                            healthProfile?.notification_preferences
                              ?.push_notifications ?? true,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="email_alerts" className="text-sm font-medium">
                    Email alerts for health emergencies
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shared">Shared Health Data</TabsTrigger>
          <TabsTrigger value="share">Share My Data</TabsTrigger>
          {healthProfile?.is_female && (
            <TabsTrigger value="period">Period Tracker</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Vitals */}
          {currentHealthData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Current Vitals</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        currentHealthData.needs_attention
                          ? "destructive"
                          : "default"
                      }
                    >
                      {currentHealthData.analysis.status === "normal"
                        ? "Normal"
                        : "Needs Attention"}
                    </Badge>
                    {currentHealthData.needs_attention && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart
                        className={`h-6 w-6 ${
                          getVitalStatus(
                            currentHealthData.vitals.heart_rate,
                            "heart_rate"
                          ) === "normal"
                            ? "text-red-600"
                            : "text-red-800"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Heart Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {currentHealthData.vitals.heart_rate}
                      </p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Droplets
                        className={`h-6 w-6 ${
                          getVitalStatus(
                            currentHealthData.vitals.spo2,
                            "spo2"
                          ) === "normal"
                            ? "text-blue-600"
                            : "text-blue-800"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SpO2</p>
                      <p className="text-2xl font-bold">
                        {currentHealthData.vitals.spo2}
                      </p>
                      <p className="text-xs text-muted-foreground">%</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className={`h-6 w-6 text-purple-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Blood Pressure
                      </p>
                      <p className="text-2xl font-bold">
                        {currentHealthData.vitals.blood_pressure_systolic}/
                        {currentHealthData.vitals.blood_pressure_diastolic}
                      </p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Thermometer
                        className={`h-6 w-6 ${
                          getVitalStatus(
                            currentHealthData.vitals.temperature,
                            "temperature"
                          ) === "normal"
                            ? "text-orange-600"
                            : "text-orange-800"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Temperature
                      </p>
                      <p className="text-2xl font-bold">
                        {currentHealthData.vitals.temperature}
                      </p>
                      <p className="text-xs text-muted-foreground">°F</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          currentHealthData.vitals.timestamp
                        ).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          currentHealthData.vitals.timestamp
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vitals Chart */}
          {vitalsHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalsChart data={vitalsHistory} />
              </CardContent>
            </Card>
          )}

          {/* Metrics Summary */}
          {currentHealthData?.analysis.metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Past Hour Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-600" />
                      Heart Rate
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        Avg:{" "}
                        {Math.round(
                          currentHealthData.analysis.metrics.heart_rate.avg
                        )}{" "}
                        bpm
                      </p>
                      <p>
                        Min: {currentHealthData.analysis.metrics.heart_rate.min}{" "}
                        bpm
                      </p>
                      <p>
                        Max: {currentHealthData.analysis.metrics.heart_rate.max}{" "}
                        bpm
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                      SpO2
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        Avg:{" "}
                        {Math.round(
                          currentHealthData.analysis.metrics.spo2.avg
                        )}
                        %
                      </p>
                      <p>Min: {currentHealthData.analysis.metrics.spo2.min}%</p>
                      <p>Max: {currentHealthData.analysis.metrics.spo2.max}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-purple-600" />
                      Blood Pressure
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        Avg:{" "}
                        {Math.round(
                          currentHealthData.analysis.metrics.blood_pressure
                            .systolic.avg
                        )}
                        /
                        {Math.round(
                          currentHealthData.analysis.metrics.blood_pressure
                            .diastolic.avg
                        )}{" "}
                        mmHg
                      </p>
                      <p>
                        Range:{" "}
                        {
                          currentHealthData.analysis.metrics.blood_pressure
                            .systolic.min
                        }
                        -
                        {
                          currentHealthData.analysis.metrics.blood_pressure
                            .systolic.max
                        }
                        /
                        {
                          currentHealthData.analysis.metrics.blood_pressure
                            .diastolic.min
                        }
                        -
                        {
                          currentHealthData.analysis.metrics.blood_pressure
                            .diastolic.max
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-orange-600" />
                      Temperature
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        Avg:{" "}
                        {currentHealthData.analysis.metrics.temperature.avg.toFixed(
                          1
                        )}
                        °F
                      </p>
                      <p>
                        Min:{" "}
                        {currentHealthData.analysis.metrics.temperature.min}°F
                      </p>
                      <p>
                        Max:{" "}
                        {currentHealthData.analysis.metrics.temperature.max}°F
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Shared Health Data Tab */}
        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Shared Health Data ({sharedUsers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sharedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No shared health data
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No users have shared their health data with you yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask them to share their data using your email: {user.email}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sharedUsers.map((sharedUser) => (
                    <SharedUserCard
                      key={sharedUser.user_id}
                      sharedUser={sharedUser}
                      isExpanded={expandedUsers.has(sharedUser.user_id)}
                      onToggleExpanded={() =>
                        toggleUserExpanded(sharedUser.user_id)
                      }
                      onMarkAttended={() =>
                        handleMarkAttended(sharedUser.user_id)
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share My Data Tab */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Share My Health Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter the email address of someone you trust to monitor your
                  health data. They must also be registered on CareBridge.
                </p>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleShareHealth} disabled={isSharing}>
                    {isSharing ? "Sharing..." : "Share"}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  What happens when you share?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The person will see your real-time health vitals</li>
                  <li>• They'll receive SOS emails if you need attention</li>
                  <li>• They can mark you as "attended" to stop alerts</li>
                  <li>• You can revoke access at any time</li>
                </ul>
              </div>

              {/* Current Sharing List */}
              {sharingList.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Currently Sharing With ({sharingList.length})
                  </h4>
                  <div className="space-y-2">
                    {sharingList.map((sharing) => (
                      <div
                        key={sharing.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {sharing.viewer_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Shared since{" "}
                              {new Date(
                                sharing.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStopSharing(sharing.viewer_email)
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          Stop Sharing
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Period Tracker Tab (for females) */}
        {healthProfile?.is_female && (
          <TabsContent value="period">
            <PeriodTracker />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default HealthMonitoringComponent;
