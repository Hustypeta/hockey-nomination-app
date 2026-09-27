const FORUM_GUEST_KEY = "lineup:guest-session:forum";

export function isForumGuestSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(FORUM_GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

export function enableForumGuestSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FORUM_GUEST_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}
