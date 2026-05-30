import { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "../modules/auth/hooks/useAdminAuth";
import { ToastProvider } from "../shared/components/ToastProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
