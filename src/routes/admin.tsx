import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Building2, Compass, LayoutDashboard, LogOut, Map, MessageSquare, Settings, Users, ExternalLink } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { SITE } from "@/config/site";
import { fr } from "@/i18n/fr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Back-office — ${SITE.name}` },
      { name: "description", content: "Espace d'administration de l'annuaire." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Back-office — ${SITE.name}` },
      { property: "og:description", content: "Espace d'administration." },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: fr.admin.dashboard, icon: LayoutDashboard, exact: true },
  { to: "/admin/profils", label: fr.admin.profiles, icon: Users },
  { to: "/admin/studios", label: fr.admin.studios, icon: Building2 },
  { to: "/admin/pays", label: fr.admin.geo, icon: Map },
  { to: "/admin/catalogues", label: fr.admin.catalogs, icon: BookOpen },
  { to: "/admin/avis", label: fr.admin.reviews, icon: MessageSquare },
  { to: "/admin/parametres", label: fr.admin.settings, icon: Settings },
] as const;

/** Faux login démo — TODO(Supabase) : remplacer par Supabase Auth + table user_roles. */
function Login() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (u === SITE.admin.username && p === SITE.admin.password) {
            useStore.getState().set(() => ({ adminSession: true }));
            toast.success("Bienvenue dans le back-office");
          } else toast.error("Identifiants incorrects");
        }}
        className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-8 shadow-elegant"
      >
        <div className="text-center">
          <Compass className="mx-auto h-9 w-9 text-gold" />
          <h1 className="mt-3 text-3xl">Back-office</h1>
          <p className="text-sm text-muted-foreground">{SITE.name}</p>
        </div>
        <div className="space-y-2"><Label htmlFor="u">Identifiant</Label><Input id="u" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus /></div>
        <div className="space-y-2"><Label htmlFor="p">Mot de passe</Label><Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></div>
        <Button type="submit" variant="velvet" className="w-full">Se connecter</Button>
        <p className="text-center text-xs text-muted-foreground">Démo : {SITE.admin.username} / {SITE.admin.password}</p>
      </form>
    </div>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2 px-2 py-4" onClick={onNavigate}>
        <Compass className="h-5 w-5 text-gold" /><span className="font-serif text-xl">{SITE.name}</span>
      </Link>
      <nav className="mt-4 flex-1 space-y-1" aria-label="Administration">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            activeOptions={{ exact: "exact" in n }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{ className: "bg-sidebar-accent text-foreground" }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border pt-3">
        <Link to="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /> Voir le site</Link>
        <button
          onClick={() => { useStore.getState().set(() => ({ adminSession: false })); navigate({ to: "/admin" }); }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> {fr.admin.logout}
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const hydrated = useStoreHydrated();
  const session = useStore((s) => s.adminSession);
  const [open, setOpen] = useState(false);
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!session) return <Login />;
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar px-3 pb-4 lg:block">
        <SideNav />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center border-b border-border px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Menu"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-3"><SheetTitle className="sr-only">Menu</SheetTitle><SideNav onNavigate={() => setOpen(false)} /></SheetContent>
          </Sheet>
          <span className="ml-2 font-serif text-lg">Back-office</span>
        </header>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
