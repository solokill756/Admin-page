import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { adminAuthApi } from "../api/adminAuthApi";
import { AdminProfile } from "../types/adminAuth.types";
import {
  clearAdminAuthStorage,
  getAdminAccessToken,
  getAdminProfile,
  setAdminAccessToken,
  setAdminProfile,
} from "./authStorage";

type AdminAuthContextValue = {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<AdminProfile | null>(() => getAdminProfile());
  const [isRestoring, setIsRestoring] = useState(() => Boolean(getAdminAccessToken()));

  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) {
      setIsRestoring(false);
      return;
    }

    let isMounted = true;

    adminAuthApi
      .me()
      .then((response) => {
        if (!isMounted) return;
        setAdmin(response.data);
        setAdminProfile(response.data);
      })
      .catch(() => {
        if (!isMounted) return;
        clearAdminAuthStorage();
        setAdmin(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoring(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await adminAuthApi.login(email, password);
    setAdminAccessToken(response.data.accessToken);
    setAdminProfile(response.data.admin);
    setAdmin(response.data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminAuthApi.logout();
    } finally {
      clearAdminAuthStorage();
      setAdmin(null);
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      isAuthenticated: Boolean(admin && getAdminAccessToken()),
      isRestoring,
      login,
      logout,
    }),
    [admin, isRestoring, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }

  return context;
}
