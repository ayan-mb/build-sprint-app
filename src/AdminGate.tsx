import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
export default function AdminGate({ children }: { children: (token: string) => ReactNode }) {
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem("admin-session") || ""; } catch { return ""; } });
  const access = useQuery(api.admin.session, { token });
  const login = useMutation(api.admin.login);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await login({ passcode });
      setPasscode("");
      if (result.token) { try { sessionStorage.setItem("admin-session", result.token); } catch {} setToken(result.token); }
      else setError(result.message);
    } catch { setError("Sign-in could not connect. Try again."); }
    finally { setBusy(false); }
  }
  if (!access) return <main><p role="status">Checking admin access…</p></main>;
  if (access.authorized) return <>{children(token)}</>;
  return <main><section className="input-area"><h1>Admin sign-in</h1><p>Enter your admin passcode to open the single-question check, Past runs and batch tools.</p>
    {!access.configured && <p className="warning">Admin access is unavailable until ADMIN_PASSCODE is set in Convex.</p>}
    <form onSubmit={submit}><label htmlFor="admin-passcode">Admin passcode</label><input id="admin-passcode" type="password" autoComplete="current-password" value={passcode} onChange={event => setPasscode(event.target.value)} maxLength={512} required disabled={busy || !access.configured} /><button type="submit" disabled={busy || !access.configured}>{busy ? "Checking…" : "Open admin"}</button>{error && <p className="error" role="alert">{error}</p>}</form>
  </section></main>;
}
