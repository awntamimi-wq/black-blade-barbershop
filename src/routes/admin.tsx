import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, TIME_SLOTS } from "@/lib/i18n";
import { barbersQuery, bookingErrorKey, servicesQuery, todayISO } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Logo, LangToggle } from "@/components/site/Nav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — BLACK BLADE" },
      { name: "description", content: "Manage BLACK BLADE appointments and services." },
      { property: "og:title", content: "Admin Dashboard — BLACK BLADE" },
      { property: "og:description", content: "Staff-only dashboard for appointments and services." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const selectCls = "h-10 w-full rounded-sm border border-input bg-background px-3 text-sm";

function AdminPage() {
  const { t } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    void supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-4 flex items-center justify-between gap-4">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link to="/" className="text-sm text-muted-foreground hover:text-gold">{t.admin.backToSite}</Link>
            {session && <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>{t.admin.signOut}</Button>}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10">
        {!ready ? null : !session ? (
          <AuthForm />
        ) : isAdmin === false ? (
          <p className="text-center text-destructive py-20">{t.admin.notAdmin}</p>
        ) : isAdmin ? (
          <Dashboard />
        ) : null}
      </main>
    </div>
  );
}

function AuthForm() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setLoading(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) toast.success(t.admin.checkEmail);
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm border border-border bg-card p-8 rounded-sm space-y-5 mt-10">
      <h1 className="text-3xl">{mode === "in" ? t.admin.signIn : t.admin.signUp}</h1>
      <div className="space-y-2"><Label htmlFor="em">{t.admin.email}</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="pw">{t.admin.password}</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button variant="gold" size="lg" className="w-full" disabled={loading}>{mode === "in" ? t.admin.signInBtn : t.admin.signUpBtn}</Button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-sm text-gold w-full">{mode === "in" ? t.admin.toggleUp : t.admin.toggleIn}</button>
      <p className="text-xs text-muted-foreground">{t.admin.firstNote}</p>
    </form>
  );
}

type Appt = {
  id: string; customer_name: string; phone: string; service_id: string; barber_id: string;
  appt_date: string; appt_time: string; status: string;
};

function Dashboard() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="text-4xl mb-8">{t.admin.title}</h1>
      <Tabs defaultValue="appts">
        <TabsList>
          <TabsTrigger value="appts">{t.admin.appointments}</TabsTrigger>
          <TabsTrigger value="services">{t.admin.services}</TabsTrigger>
        </TabsList>
        <TabsContent value="appts" className="mt-6"><Appointments /></TabsContent>
        <TabsContent value="services" className="mt-6"><ServicesAdmin /></TabsContent>
      </Tabs>
    </>
  );
}

function Appointments() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const [editing, setEditing] = useState<Appt | null>(null);
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: barbers = [] } = useQuery(barbersQuery);
  const { data = [] } = useQuery({
    queryKey: ["appointments", filter],
    queryFn: async () => {
      let q = supabase.from("appointments").select("*").order("appt_date").order("appt_time");
      if (filter === "upcoming") q = q.gte("appt_date", todayISO()).neq("status", "cancelled");
      const { data, error } = await q;
      if (error) throw error;
      return data as Appt[];
    },
  });
  const name = (list: { id: string; name_en: string; name_ar: string }[], id: string) => {
    const x = list.find((i) => i.id === id);
    return x ? (lang === "ar" ? x.name_ar : x.name_en) : "—";
  };
  const update = async (id: string, patch: Partial<Appt>) => {
    const { error } = await supabase.from("appointments").update(patch).eq("id", id);
    if (error) {
      const k = bookingErrorKey(error.message) as keyof typeof t.booking.errors;
      toast.error(t.booking.errors[k]);
      return false;
    }
    toast.success(t.admin.updated);
    qc.invalidateQueries({ queryKey: ["appointments"] });
    qc.invalidateQueries({ queryKey: ["slots"] });
    return true;
  };
  return (
    <>
      <div className="flex gap-2 mb-4">
        {(["upcoming", "all"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "gold" : "outline"} onClick={() => setFilter(f)}>{t.admin[f]}</Button>
        ))}
      </div>
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full text-sm">
          <thead className="bg-card text-muted-foreground">
            <tr>{[t.booking.date, t.booking.time, t.admin.customer, t.booking.service, t.booking.barber, t.admin.status, t.admin.actions].map((h) => <th key={h} className="p-3 text-start font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{t.admin.none}</td></tr>}
            {data.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap" dir="ltr">{a.appt_date}</td>
                <td className="p-3" dir="ltr">{a.appt_time.slice(0, 5)}</td>
                <td className="p-3"><div>{a.customer_name}</div><a href={`tel:${a.phone}`} className="text-xs text-muted-foreground" dir="ltr">{a.phone}</a></td>
                <td className="p-3">{name(services, a.service_id)}</td>
                <td className="p-3">{name(barbers, a.barber_id)}</td>
                <td className="p-3">
                  <span className={cn("text-xs px-2 py-1 rounded-sm border",
                    a.status === "confirmed" && "border-gold/50 text-gold",
                    a.status === "completed" && "border-success/50 text-success",
                    a.status === "cancelled" && "border-destructive/50 text-destructive")}>
                    {t.admin.statuses[a.status as keyof typeof t.admin.statuses]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(a)}>{t.admin.edit}</Button>
                    {a.status === "confirmed" && <>
                      <Button size="sm" variant="secondary" onClick={() => update(a.id, { status: "completed" })}>{t.admin.complete}</Button>
                      <Button size="sm" variant="destructive" onClick={() => update(a.id, { status: "cancelled" })}>{t.admin.cancel}</Button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.admin.editAppt}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-4" onSubmit={async (e) => {
              e.preventDefault();
              const { id, ...rest } = editing;
              if (await update(id, { ...rest, appt_time: rest.appt_time.slice(0, 5) })) setEditing(null);
            }}>
              <div className="space-y-1"><Label>{t.booking.name}</Label><Input value={editing.customer_name} onChange={(e) => setEditing({ ...editing, customer_name: e.target.value })} /></div>
              <div className="space-y-1"><Label>{t.booking.phone}</Label><Input dir="ltr" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="space-y-1"><Label>{t.booking.service}</Label>
                <select className={selectCls} value={editing.service_id} onChange={(e) => setEditing({ ...editing, service_id: e.target.value })}>
                  {services.map((s) => <option key={s.id} value={s.id}>{lang === "ar" ? s.name_ar : s.name_en}</option>)}
                </select></div>
              <div className="space-y-1"><Label>{t.booking.barber}</Label>
                <select className={selectCls} value={editing.barber_id} onChange={(e) => setEditing({ ...editing, barber_id: e.target.value })}>
                  {barbers.map((b) => <option key={b.id} value={b.id}>{lang === "ar" ? b.name_ar : b.name_en}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>{t.booking.date}</Label><Input type="date" value={editing.appt_date} onChange={(e) => setEditing({ ...editing, appt_date: e.target.value })} /></div>
                <div className="space-y-1"><Label>{t.booking.time}</Label>
                  <select className={selectCls} value={editing.appt_time.slice(0, 5)} onChange={(e) => setEditing({ ...editing, appt_time: e.target.value })}>
                    {TIME_SLOTS.map((s) => <option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div className="space-y-1"><Label>{t.admin.status}</Label>
                <select className={selectCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {Object.entries(t.admin.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <Button variant="gold" size="lg">{t.admin.save}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type Svc = { id?: string; name_en: string; name_ar: string; description_en: string; description_ar: string; price: number; duration_min: number; active: boolean; sort: number };
const emptySvc: Svc = { name_en: "", name_ar: "", description_en: "", description_ar: "", price: 10, duration_min: 30, active: true, sort: 99 };

function ServicesAdmin() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data = [] } = useQuery(servicesQuery);
  const [editing, setEditing] = useState<Svc | null>(null);
  const save = async (s: Svc) => {
    if (!s.name_en.trim() || !s.name_ar.trim() || s.price < 0 || s.duration_min < 5) {
      toast.error(t.booking.errors.generic);
      return;
    }
    const { id, ...rest } = s;
    const { error } = id ? await supabase.from("services").update(rest).eq("id", id) : await supabase.from("services").insert(rest);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t.admin.updated);
    qc.invalidateQueries({ queryKey: ["services"] });
    setEditing(null);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      // Services with appointments can't be deleted; deactivate instead.
      await supabase.from("services").update({ active: false }).eq("id", id);
    }
    qc.invalidateQueries({ queryKey: ["services"] });
    toast.success(t.admin.updated);
  };
  return (
    <>
      <Button variant="gold" className="mb-4" onClick={() => setEditing({ ...emptySvc })}>{t.admin.addService}</Button>
      <div className="grid gap-3">
        {data.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 border border-border bg-card p-4 rounded-sm">
            <div className="flex-1 min-w-48">
              <p className="font-medium">{s.name_en} · <span className="text-muted-foreground">{s.name_ar}</span></p>
              <p className="text-xs text-muted-foreground">{s.duration_min} min</p>
            </div>
            <span className="font-display text-xl text-gold">{Number(s.price)} JOD</span>
            <Switch checked={s.active} onCheckedChange={(v) => save({ ...s, price: Number(s.price), active: v })} aria-label={t.admin.active} />
            <Button size="sm" variant="outline" onClick={() => setEditing({ ...s, price: Number(s.price) })}>{t.admin.edit}</Button>
            <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>{t.admin.delete}</Button>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? t.admin.edit : t.admin.addService}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save(editing); }}>
              {(["name_en", "name_ar", "description_en", "description_ar"] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <Label>{t.admin[({ name_en: "nameEn", name_ar: "nameAr", description_en: "descEn", description_ar: "descAr" } as const)[k]]}</Label>
                  <Input maxLength={k.startsWith("name") ? 60 : 200} dir={k.endsWith("ar") ? "rtl" : "ltr"} value={editing[k]} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>{t.admin.price}</Label><Input type="number" min={0} step="0.5" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>{t.admin.duration}</Label><Input type="number" min={5} step={5} value={editing.duration_min} onChange={(e) => setEditing({ ...editing, duration_min: Number(e.target.value) })} /></div>
              </div>
              <Button variant="gold" size="lg">{t.admin.save}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
