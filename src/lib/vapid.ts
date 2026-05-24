// VAPID public key is safe to expose in client code (it's the public half of a key pair).
// The matching private key is stored as a Supabase edge function secret (VAPID_PRIVATE_KEY).
export const VAPID_PUBLIC_KEY =
  "BK_YHfgNO1zFVyQ-IfaMSBmPeP-Y4AMA1IOES10VGGWVEtm9v0hrygRUi7RrVIbo5gPuoQSLCxqdr5XyPp4d3VI";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
