"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function NotificationPreferences() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newTripAlerts: true,
    chargingSessionUpdates: true,
    promotionalOffers: false,
  });
  const { toast } = useToast();

  const handleSavePreferences = () => {
    // In a real application, you would send these settings to your API
    console.log("Saving notification preferences:", settings);
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notification Channels</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            {/* <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            /> */}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            {/* <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pushNotifications: checked })
              }
            /> */}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            {/* <Switch
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, smsNotifications: checked })
              }
            /> */}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notification Types</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-trip-alerts">New Trip Alerts</Label>
            {/* <Switch
              id="new-trip-alerts"
              checked={settings.newTripAlerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, newTripAlerts: checked })
              }
            /> */}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="charging-session-updates">Charging Session Updates</Label>
            {/* <Switch
              id="charging-session-updates"
              checked={settings.chargingSessionUpdates}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, chargingSessionUpdates: checked })
              }
            /> */}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="promotional-offers">Promotional Offers</Label>
            {/* <Switch
              id="promotional-offers"
              checked={settings.promotionalOffers}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, promotionalOffers: checked })
              }
            /> */}
          </div>
        </div>

        <Button onClick={handleSavePreferences}>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}