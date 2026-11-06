import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <span className="font-display text-xl tracking-[0.25em]">
      BLACK <span className="text-gold-gradient">BLADE</span>
    </span>
  );
}

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="text-xs tracking-widest border border-border px-3 py-1.5 rounded-sm hover:border-gold hover:text-gold transition-colors"
      aria-label="Switch language"
    >
      {lang === "en" ? "العربية" : "EN"}
    </button>
  );
}

export function Nav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    ["about", t.nav.about],
    ["services", t.nav.services],
    ["gallery", t.nav.gallery],
    ["team", t.nav.team],
    ["reviews", t.nav.reviews],
    ["contact", t.nav.contact],
  ] as const;
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/90 backdrop-blur-md border-b border-border py-3" : "py-6",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label="BLACK BLADE home"><Logo /></a>
        <ul className="hidden lg:flex items-center gap-8">
          {links.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="group relative text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
                <span className="absolute -bottom-1 start-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden lg:flex items-center gap-4">
          <LangToggle />
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-gold transition-colors">{t.nav.admin}</Link>
          <Button variant="gold" asChild><a href="#booking">{t.nav.book}</a></Button>
        </div>
        <div className="flex lg:hidden items-center gap-3">
          <LangToggle />
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="p-2">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden animate-in slide-in-from-top-4 fade-in duration-300 border-t border-border bg-background/95 backdrop-blur-md">
          <ul className="flex flex-col px-5 py-6 gap-5">
            {links.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={() => setOpen(false)} className="font-display text-2xl">{label}</a>
              </li>
            ))}
            <li><Link to="/admin" className="text-sm text-muted-foreground">{t.nav.admin}</Link></li>
            <li><Button variant="gold" size="xl" className="w-full" asChild><a href="#booking" onClick={() => setOpen(false)}>{t.nav.book}</a></Button></li>
          </ul>
        </div>
      )}
    </header>
  );
}
