import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, MessageCircle, Phone, Star, Instagram, Facebook } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import aboutImg from "@/assets/about.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import { useI18n } from "@/lib/i18n";
import { BARBER_PHOTOS, barbersQuery, servicesQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./Reveal";
import { Logo } from "./Nav";

export const WHATSAPP_URL = "https://wa.me/962700000000?text=" + encodeURIComponent("Hello BLACK BLADE, I'd like to book an appointment.");

export function Hero() {
  const { t } = useI18n();
  return (
    <section id="top" className="relative min-h-[100svh] flex items-end overflow-hidden">
      <img src={heroImg} alt="Barber shaving a client at BLACK BLADE" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover animate-slow-zoom" />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8 pb-24 md:pb-32">
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-4 duration-700">{t.hero.eyebrow}</p>
        <h1 className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-medium leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {t.hero.title1}
          <br />
          <span className="italic text-gold-gradient">{t.hero.title2}</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground animate-in fade-in duration-1000 delay-300 fill-mode-both">{t.hero.sub}</p>
        <div className="mt-10 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          <Button variant="gold" size="xl" asChild><a href="#booking">{t.hero.cta}</a></Button>
          <Button variant="goldOutline" size="xl" asChild><a href="#services">{t.hero.cta2}</a></Button>
        </div>
      </div>
    </section>
  );
}

export function About() {
  const { t } = useI18n();
  return (
    <section id="about" className="py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <Reveal className="relative">
          <img src={aboutImg} alt="Barber tools" loading="lazy" width={1152} height={896} className="w-full aspect-[4/3] object-cover rounded-sm" />
          <div className="absolute -bottom-6 -end-6 hidden md:block h-40 w-40 border border-gold/50" />
        </Reveal>
        <div>
          <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} center={false} />
          <Reveal delay={100}><p className="text-lg text-muted-foreground leading-relaxed">{t.about.p1}</p></Reveal>
          <Reveal delay={200}><p className="mt-5 text-lg text-muted-foreground leading-relaxed">{t.about.p2}</p></Reveal>
          <Reveal delay={300} className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-10">
            {t.about.stats.map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-4xl text-gold-gradient">{n}</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Services({ onPick }: { onPick: (id: string) => void }) {
  const { t, lang } = useI18n();
  const { data = [] } = useQuery(servicesQuery);
  return (
    <section id="services" className="py-28 md:py-36 bg-charcoal">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} />
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
          {data.filter((s) => s.active).map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 120}>
              <div className="group border-b border-border py-7 transition-colors hover:border-gold/60">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-2xl group-hover:text-gold transition-colors">{lang === "ar" ? s.name_ar : s.name_en}</h3>
                  <span className="flex-1 border-b border-dotted border-border translate-y-[-4px]" />
                  <span className="font-display text-2xl text-gold">{Number(s.price)} <span className="text-sm">{t.services.currency}</span></span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-muted-foreground">{lang === "ar" ? s.description_ar : s.description_en}</p>
                  <button onClick={() => onPick(s.id)} className="shrink-0 text-xs uppercase tracking-widest text-gold opacity-70 hover:opacity-100 transition-opacity">
                    {t.services.book} →
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="size-3" />{s.duration_min} {t.services.min}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const { t } = useI18n();
  const imgs = [
    [g1, "Skin fade haircut", "md:row-span-2"],
    [heroImg, "Straight razor beard trim", "md:col-span-2"],
    [g2, "Sculpted full beard", ""],
    [g3, "Classic slick back", ""],
  ] as const;
  return (
    <section id="gallery" className="py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:h-[640px]">
          {imgs.map(([src, alt, cls], i) => (
            <Reveal key={i} delay={i * 100} className={`${cls} overflow-hidden rounded-sm group relative aspect-square md:aspect-auto`}>
              <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                <span className="text-sm tracking-widest uppercase text-gold">{alt}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Team() {
  const { t, lang } = useI18n();
  const { data = [] } = useQuery(barbersQuery);
  return (
    <section id="team" className="py-28 md:py-36 bg-charcoal">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.team.eyebrow} title={t.team.title} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((b, i) => {
            const slug = b.slug as keyof typeof t.team.roles;
            return (
              <Reveal key={b.id} delay={i * 120}>
                <article className="group">
                  <div className="overflow-hidden rounded-sm relative">
                    <img src={BARBER_PHOTOS[b.slug]} alt={b.name_en} loading="lazy" width={768} height={1024} className="aspect-[3/4] w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gold-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                  <h3 className="mt-6 text-2xl">{lang === "ar" ? b.name_ar : b.name_en}</h3>
                  <p className="eyebrow mt-2">{t.team.roles[slug]}</p>
                  <p className="mt-3 text-muted-foreground">{t.team.bios[slug]}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const { t } = useI18n();
  return (
    <section id="reviews" className="py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.reviews.eyebrow} title={t.reviews.title} />
        <p className="-mt-8 mb-12 text-center text-xs uppercase tracking-widest text-muted-foreground">
          <span className="border border-border px-3 py-1 rounded-sm">{t.reviews.demo}</span>
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {t.reviews.items.map(([q, a], i) => (
            <Reveal key={a} delay={i * 120}>
              <figure className="h-full border border-border bg-card p-8 rounded-sm transition-all duration-500 hover:border-gold/60 hover:-translate-y-1">
                <div className="flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-current" />)}</div>
                <blockquote className="mt-6 font-display text-xl leading-relaxed">“{q}”</blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">— {a}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { t } = useI18n();
  const items = [
    [MapPin, t.contact.address, t.contact.addressV, undefined],
    [Phone, t.contact.phone, t.contact.phoneV, "tel:+962700000000"],
    [Clock, t.contact.hours, t.contact.hoursV, undefined],
    [Mail, t.contact.email, t.contact.emailV, "mailto:hello@blackblade.example"],
  ] as const;
  return (
    <section id="contact" className="py-28 md:py-36 bg-charcoal">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} />
        <p className="-mt-8 mb-12 text-center text-xs uppercase tracking-widest text-gold">{t.contact.placeholder}</p>
        <div className="grid lg:grid-cols-2 gap-10">
          <Reveal className="space-y-8">
            {items.map(([Icon, label, value, href]) => (
              <div key={label} className="flex gap-5">
                <div className="size-12 shrink-0 grid place-items-center border border-gold/40 text-gold rounded-sm"><Icon className="size-5" /></div>
                <div>
                  <p className="eyebrow">{label}</p>
                  {href ? <a href={href} className="mt-1 block text-lg hover:text-gold transition-colors" dir="ltr">{value}</a> : <p className="mt-1 text-lg">{value}</p>}
                </div>
              </div>
            ))}
            <Button variant="whatsapp" size="xl" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle />{t.contact.whatsapp}</a>
            </Button>
          </Reveal>
          <Reveal delay={150}>
            <div className="relative h-full min-h-[360px] rounded-sm border border-border bg-card overflow-hidden grid place-items-center" role="img" aria-label={t.contact.map}>
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
              <div className="relative text-center">
                <MapPin className="mx-auto size-10 text-gold animate-bounce" />
                <p className="mt-4 eyebrow">{t.contact.map}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const links = ["about", "services", "gallery", "team", "booking", "contact"] as const;
  const labels: Record<string, string> = { ...t.nav, booking: t.nav.book };
  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 text-muted-foreground max-w-xs">{t.footer.tagline}</p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook].map((I, k) => (
              <a key={k} href="#top" aria-label="Social profile (placeholder)" className="size-10 grid place-items-center border border-border rounded-sm hover:border-gold hover:text-gold transition-colors"><I className="size-4" /></a>
            ))}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="size-10 grid place-items-center border border-border rounded-sm hover:border-gold hover:text-gold transition-colors"><MessageCircle className="size-4" /></a>
          </div>
        </div>
        <div>
          <p className="eyebrow">{t.footer.links}</p>
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {links.map((l) => <li key={l}><a href={`#${l}`} className="text-muted-foreground hover:text-gold transition-colors">{labels[l]}</a></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.visit}</p>
          <p className="mt-5 text-muted-foreground">{t.contact.addressV}</p>
          <p className="mt-2 text-muted-foreground">{t.contact.hoursV}</p>
          <p className="mt-2 text-muted-foreground" dir="ltr">{t.contact.phoneV}</p>
        </div>
      </div>
      <p className="mt-14 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} BLACK BLADE. {t.footer.rights}</p>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
      className="fixed bottom-6 end-6 z-40 size-14 rounded-full bg-whatsapp text-foreground grid place-items-center shadow-gold hover:scale-110 transition-transform">
      <MessageCircle className="size-6" />
    </a>
  );
}
