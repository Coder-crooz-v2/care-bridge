"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LiveMonitoringComponent from "./LiveMonitoringComponent";
import SharedUsersTab from "./SharedUsersTab";

function HealthMonitoringComponent() {
  const [activeTab, setActiveTab] = useState("live-monitoring");

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Health Monitoring
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor your vital signs and health metrics in real-time
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="live-monitoring" className="text-xs sm:text-sm">
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="shared-users" className="text-xs sm:text-sm">
            Shared Users
          </TabsTrigger>
          <TabsTrigger value="menstrual-tracker" className="text-xs sm:text-sm">
            Menstrual Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-monitoring" className="space-y-4">
          <LiveMonitoringComponent />
        </TabsContent>

        <TabsContent value="shared-users" className="space-y-4">
          <SharedUsersTab />
        </TabsContent>

        <TabsContent
          value="menstrual-tracker"
          className="space-y-4"
        ></TabsContent>
      </Tabs>
    </div>
  );
}

export default HealthMonitoringComponent;
