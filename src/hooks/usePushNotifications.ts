import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/vapid";

type PushStatus = "unsupported" | "denied" | "granted" | "default" | "loading";

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("lovableproject.com") ||
   window.location.hostname.includes("id-preview--"));

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as PushStatus);
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    }).catch(() => { /* preview iframe – ignore */ });
  }, []);

  const subscribe = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    if (status === "unsupported") return { ok: false, reason: "Push not supported on this device" };
    if (isInIframe || isPreviewHost) {
      return { ok: false, reason: "Push works only on the published site, not in the editor preview." };
    }

    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    setStatus(permission as PushStatus);
    if (permission !== "granted") return { ok: false, reason: "Permission denied" };

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    const json = sub.toJSON();
    const { error } = await supabase.functions.invoke("subscribe-push", {
      body: {
        platform: "web",
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        user_agent: navigator.userAgent,
      },
    });
    if (error) return { ok: false, reason: error.message };
    setSubscribed(true);
    return { ok: true };
  }, [status]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.functions.invoke("subscribe-push", {
          method: "DELETE",
          body: { platform: "web", endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return { status, subscribed, subscribe, unsubscribe, isPreviewHost: isPreviewHost || isInIframe };
}
