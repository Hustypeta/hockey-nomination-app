import { redirect } from "next/navigation";

/** Krátká URL → cover plátno na úvodní stránce. */
export default function CoverShortcutPage() {
  redirect("/?cover=true");
}
