import { resolveFacebookAppId } from "@/lib/facebookApp";

/** Explicitní tag — někdy spolehlivější než jen Metadata API u hostingů bez rebuild po změně env. */
export function FacebookAppIdMeta() {
  const id = resolveFacebookAppId();
  if (!id) return null;
  return <meta content={id} property="fb:app_id" />;
}
