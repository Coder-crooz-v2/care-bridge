"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import SharedUserCard from "./SharedUserCard";

interface SharedUser {
  id: number;
  sharedTo: {
    id: string;
    email: string;
  };
  createdAt: string;
}

interface SharedWithMeUser {
  id: number;
  sharedBy: {
    id: string;
    email: string;
  };
  createdAt: string;
}

export default function SharedUsersTab() {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [myShares, setMyShares] = useState<SharedUser[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<SharedWithMeUser[]>([]);
  const [isLoadingMyShares, setIsLoadingMyShares] = useState(true);
  const [isLoadingSharedWithMe, setIsLoadingSharedWithMe] = useState(true);

  useEffect(() => {
    fetchMyShares();
    fetchSharedWithMe();
  }, []);

  async function fetchMyShares() {
    try {
      setIsLoadingMyShares(true);
      const response = await fetch("/api/health-data/my-shares");

      if (!response.ok) {
        throw new Error("Failed to fetch sharing permissions");
      }

      const result = await response.json();

      if (result.success) {
        setMyShares(result.data);
      }
    } catch (error) {
      console.error("Error fetching my shares:", error);
    } finally {
      setIsLoadingMyShares(false);
    }
  }

  async function fetchSharedWithMe() {
    try {
      setIsLoadingSharedWithMe(true);
      const response = await fetch("/api/health-data/shared-with-me");

      if (!response.ok) {
        throw new Error("Failed to fetch shared data");
      }

      const result = await response.json();

      if (result.success) {
        setSharedWithMe(result.data);
      }
    } catch (error) {
      console.error("Error fetching shared with me:", error);
    } finally {
      setIsLoadingSharedWithMe(false);
    }
  }

  async function handleShare() {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsSharing(true);

      const response = await fetch("/api/health-data/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to share data");
        return;
      }

      toast.success(`Successfully shared data with ${email}`);
      setEmail("");
      await fetchMyShares();
    } catch (error) {
      toast.error("An error occurred while sharing data");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRevoke(sharedToId: string, email: string) {
    try {
      const response = await fetch(
        `/api/health-data/share?sharedToId=${sharedToId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to revoke permission");
        return;
      }

      toast.success(`Revoked sharing permission for ${email}`);
      await fetchMyShares();
    } catch (error) {
      toast.error("An error occurred while revoking permission");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 mt-2 sm:mt-4">
      <Tabs defaultValue="shared-with-me" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-md">
          <TabsTrigger value="shared-with-me" className="text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Shared With Me</span>
            <span className="sm:hidden">Shared</span>
          </TabsTrigger>
          <TabsTrigger value="my-sharing" className="text-xs sm:text-sm">
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My Sharing</span>
            <span className="sm:hidden">Sharing</span>
          </TabsTrigger>
        </TabsList>

        {/* Users who shared data with me */}
        <TabsContent value="shared-with-me" className="space-y-4">
          {isLoadingSharedWithMe ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              </CardContent>
            </Card>
          ) : sharedWithMe.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No users have shared their health data with you yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sharedWithMe.map((share) => (
                <SharedUserCard
                  key={share.id}
                  userId={share.sharedBy.id}
                  email={share.sharedBy.email}
                  sharedAt={share.createdAt}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My sharing permissions */}
        <TabsContent value="my-sharing" className="space-y-4">
          {/* Share Form */}
          <Card className="gap-0 py-0">
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                Share Your Health Data
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter the email address of a user to share your health data with
                them
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleShare()}
                    className="text-sm sm:text-base"
                  />
                </div>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="text-sm sm:text-base w-full sm:w-auto"
                >
                  {isSharing ? "Sharing..." : "Share"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* List of users with permission */}
          <Card className="gap-0">
            <CardHeader className="px-4 py-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                Active Sharing Permissions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Users who can currently view your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-4 sm:px-6">
              {isLoadingMyShares ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : myShares.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Share2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't shared your data with anyone yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myShares.map((share) => (
                    <div
                      key={share.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2"
                    >
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {share.sharedTo.email}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Shared on{" "}
                          {new Date(share.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRevoke(share.sharedTo.id, share.sharedTo.email)
                        }
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
