import { AdminProfile } from "../types/adminAuth.types";

const ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_PROFILE_KEY = "adminProfile";

export function getAdminAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAdminProfile(): AdminProfile | null {
  const raw = window.localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminProfile;
    if (parsed.role !== "admin") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setAdminProfile(admin: AdminProfile): void {
  window.localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
}

export function clearAdminAuthStorage(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_PROFILE_KEY);
}
