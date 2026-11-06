import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, TIME_SLOTS } from "@/lib/i18n";
import { barbersQuery, bookedSlotsQuery, bookingErrorKey, isPastSlot, servicesQuery, todayISO } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SectionHeading, Reveal } from "./Reveal";

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/),
  service: z.string().uuid(),
  barber: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

type Form = { name: string; phone: string; service: string; barber: string; date: string; time: string };

const selectCls = "h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function Booking({ service, setService }: { service: string; setService: (s: string) => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [f, setF] = useState<Omit<Form, "service">>({ name: "", phone: "", barber: "", date: "", time: "" });
  const form: Form = { ...f, service };
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: barbers = [] } = useQuery(barbersQuery);
  const { data: booked = [] } = useQuery(bookedSlotsQuery(f.barber, f.date));

  const set = (k: keyof Form, v: string) => {
    if (k === "service") setService(v);
    else setF((p) => ({ ...p, [k]: v, ...(k === "barber" || k === "date" ? { time: "" } : {}) }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setStatus(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = bookingSchema.safeParse(form);
    if (!r.success) {
      const errs: typeof errors = {};
      r.error.issues.forEach((i) => {
        const k = i.path[0] as keyof Form;
        errs[k] = t.booking.errors[k];
      });
      setErrors(errs);
      setStatus({ ok: false, msg: Object.values(errs)[0]! });
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("book_appointment", {
      _name: form.name, _phone: form.phone, _service: form.service, _barber: form.barber, _date: form.date, _time: form.time,
    });
    setLoading(false);
    qc.invalidateQueries({ queryKey: ["slots"] });
    if (error) {
      const key = bookingErrorKey(error.message) as keyof typeof t.booking.errors;
      const msg = t.booking.errors[key];
      setStatus({ ok: false, msg });
      toast.error(msg);
      return;
    }
    const msg = t.booking.success.replace("{date}", form.date).replace("{time}", form.time);
    setStatus({ ok: true, msg });
    toast.success(msg);
    setF({ name: "", phone: "", barber: "", date: "", time: "" });
  };

  const field = (k: keyof Form) => cn(errors[k] && "border-destructive");

  return (
    <section id="booking" className="py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <SectionHeading eyebrow={t.booking.eyebrow} title={t.booking.title} />
        <p className="-mt-8 mb-12 text-center text-muted-foreground">{t.booking.sub}</p>
        <Reveal>
          <form onSubmit={submit} noValidate className="border border-border bg-card p-6 md:p-10 rounded-sm grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bk-name">{t.booking.name}</Label>
              <Input id="bk-name" maxLength={100} value={f.name} onChange={(e) => set("name", e.target.value)} className={cn("h-12", field("name"))} autoComplete="name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bk-phone">{t.booking.phone}</Label>
              <Input id="bk-phone" type="tel" dir="ltr" maxLength={20} placeholder="+962 7…" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={cn("h-12", field("phone"))} autoComplete="tel" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bk-service">{t.booking.service}</Label>
              <select id="bk-service" value={service} onChange={(e) => set("service", e.target.value)} className={cn(selectCls, field("service"))}>
                <option value="">{t.booking.choose}</option>
                {services.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{lang === "ar" ? s.name_ar : s.name_en} — {Number(s.price)} {t.services.currency}</option>
                ))}
              </select>
              {errors.service && <p className="text-xs text-destructive">{errors.service}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bk-barber">{t.booking.barber}</Label>
              <select id="bk-barber" value={f.barber} onChange={(e) => set("barber", e.target.value)} className={cn(selectCls, field("barber"))}>
                <option value="">{t.booking.choose}</option>
                {barbers.map((b) => <option key={b.id} value={b.id}>{lang === "ar" ? b.name_ar : b.name_en}</option>)}
              </select>
              {errors.barber && <p className="text-xs text-destructive">{errors.barber}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bk-date">{t.booking.date}</Label>
              <Input id="bk-date" type="date" min={todayISO()} value={f.date} onChange={(e) => set("date", e.target.value)} className={cn("h-12", field("date"))} />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label>{t.booking.time}</Label>
              {f.barber && f.date ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" role="radiogroup" aria-label={t.booking.time}>
                  {TIME_SLOTS.map((s) => {
                    const disabled = booked.includes(s) || isPastSlot(f.date, s);
                    const active = f.time === s;
                    return (
                      <button type="button" key={s} disabled={disabled} onClick={() => set("time", s)} role="radio" aria-checked={active} dir="ltr"
                        className={cn("h-10 rounded-sm border text-sm transition-all",
                          active ? "border-gold bg-gold text-primary-foreground" : "border-border hover:border-gold hover:text-gold",
                          disabled && "opacity-30 line-through cursor-not-allowed hover:border-border hover:text-foreground")}
                        title={booked.includes(s) ? t.booking.taken : undefined}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.booking.pickBarberDate}</p>
              )}
              {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
            </div>
            {status && (
              <div role="status" className={cn("md:col-span-2 flex items-start gap-3 rounded-sm border p-4 text-sm animate-in fade-in",
                status.ok ? "border-success/50 text-success" : "border-destructive/50 text-destructive")}>
                {status.ok ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
                {status.msg}
              </div>
            )}
            <Button type="submit" variant="gold" size="xl" disabled={loading} className="md:col-span-2">
              {loading ? t.booking.submitting : t.booking.submit}
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
