import { FormEvent, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { AdminApiError } from "../../../shared/api/httpClient";
import { useAdminAuth } from "../hooks/useAdminAuth";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
  ADMIN_ONLY: "Tài khoản này không có quyền admin",
  ACCOUNT_BLOCKED: "Tài khoản đã bị chặn",
  UNKNOWN_ERROR: "Có lỗi xảy ra, vui lòng thử lại",
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isRestoring, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorMessage = useMemo(() => {
    if (!errorCode) return null;
    return ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
  }, [errorCode]);

  if (!isRestoring && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorCode(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setErrorCode(error instanceof AdminApiError ? error.code : "UNKNOWN_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark">N</span>
          <div>
            <p>Nutrition Coach</p>
            <h1 id="login-title">Admin Login</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="field-control">
              <Mail size={18} aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="field-control">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
