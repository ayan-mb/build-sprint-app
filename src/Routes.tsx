import App from "./App";
import PastRuns, { SavedRun } from "./PastRuns";
import BatchScreen, { FuxiNavigation } from "./BatchScreen";
import AdminGate from "./AdminGate";
export function AdminNavigation({ batch = false }: { batch?: boolean }) {
  return <nav className="screen-nav" aria-label="Milestones"><a href="/admin" aria-current={batch ? undefined : "page"}>Single-question diagnostic</a><a href="/batch" aria-current={batch ? "page" : undefined}>Batch baseline</a></nav>;
}
export function Routes({ path }: { path: string }) {
  if (path === "/saved") return <><FuxiNavigation /><SavedRun /></>;
  if (path === "/admin" || path === "/batch") return <AdminGate>{token => <><AdminNavigation batch={path === "/batch"} />{path === "/batch" ? <BatchScreen adminToken={token} /> : <><App /><div className="home-history"><PastRuns adminToken={token} /></div></>}</>}</AdminGate>;
  return <BatchScreen prospect />;
}
