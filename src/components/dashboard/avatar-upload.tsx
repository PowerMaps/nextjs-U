"use client";

import React, { useState } from 'react';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api/client';

export function AvatarUpload() {
  const { user, refreshUser } = useCurrentUser();
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);
      await apiClient.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await refreshUser();
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await apiClient.delete("/users/me/avatar");
      await refreshUser();
      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove avatar. Please try again.",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user?.firstName} alt={user?.email} />
        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          id="avatar-upload"
          className="hidden"
          onChange={handleAvatarChange}
          accept="image/*"
        />
        <label htmlFor="avatar-upload">
          <Button asChild disabled={isUploading}>
            <span>{isUploading ? "Uploading..." : "Change Avatar"}</span>
          </Button>
        </label>
        <Button variant="outline" onClick={handleRemoveAvatar} disabled={!user?.firstName}>
          Remove Avatar
        </Button>
      </div>
    </div>
  );
}