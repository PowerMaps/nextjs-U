"use client";

import { toast } from '@/components/ui/use-toast';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseApp from '@/lib/firebase/firebase-config';

// Request notification permission and get token
export async function requestNotificationPermission() {
  if (typeof window === 'undefined') return;

  try {
    const messaging = getMessaging(firebaseApp);
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      console.log("FCM Token:", token);
      toast({
        title: "Notifications Enabled",
        description: "You will now receive push notifications.",
      });
      return token;
    } else {
      toast({
        title: "Notifications Denied",
        description: "You have blocked push notifications.",
        variant: "destructive",
      });
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    toast({
      title: "Notification Error",
      description: "Failed to set up push notifications.",
      variant: "destructive",
    });
    return null;
  }
}

// Listen for incoming messages while app is in foreground
export function onForegroundMessage() {
  if (typeof window === 'undefined') return;

  const messaging = getMessaging(firebaseApp);
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    toast({
      title: payload.notification?.title || "New Notification",
      description: payload.notification?.body || "",
    });
  });
}

// Register service worker for background messages (requires firebase-messaging-sw.js)
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}
