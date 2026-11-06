import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const en = {
  nav: { about: "About", services: "Services", gallery: "Gallery", team: "Team", reviews: "Reviews", contact: "Contact", book: "Book Now", admin: "Admin" },
  hero: {
    eyebrow: "Est. 2016 · Premium Grooming",
    title1: "Sharp Cuts.",
    title2: "Sharper Presence.",
    sub: "Precision barbering, hot-towel rituals and a lounge built for men who take their image seriously.",
    cta: "Book Appointment",
    cta2: "View Services",
  },
  about: {
    eyebrow: "Our Story",
    title: "Where craft meets character",
    p1: "BLACK BLADE was born from a simple idea: a haircut should feel like an event. Our barbers blend classic technique with modern style, taking time to understand your face shape, lifestyle and the look you want.",
    p2: "Expect a warm welcome, a strong coffee and an hour that's entirely yours.",
    stats: [["10+", "Years of craft"], ["12k", "Cuts delivered"], ["4.9", "Average rating"]],
  },
  services: { eyebrow: "The Menu", title: "Services & Pricing", min: "min", book: "Book", currency: "JOD" },
  gallery: { eyebrow: "Portfolio", title: "Fresh from the chair" },
  team: {
    eyebrow: "The Barbers",
    title: "Masters of the blade",
    roles: { omar: "Master Barber · Fades", karim: "Senior Stylist · Classic cuts", yousef: "Founder · Shaves & beards" },
    bios: {
      omar: "Known for flawless skin fades and razor-sharp line-ups.",
      karim: "Scissor-work specialist with an eye for texture.",
      yousef: "Twenty years behind the chair. The royal shave is his signature.",
    },
  },
  reviews: {
    eyebrow: "Testimonials",
    title: "What clients say",
    demo: "Demo reviews — sample content for illustration",
    items: [
      ["Best fade I've had in years. Omar is an artist.", "Ahmad R."],
      ["The royal shave is pure luxury. Worth every dinar.", "Laith M."],
      ["Clean, professional, on time. My go-to shop now.", "Sami K."],
    ],
  },
  booking: {
    eyebrow: "Reservations",
    title: "Book your appointment",
    sub: "Choose your service, barber and time. We'll hold your chair.",
    name: "Full name", phone: "Phone number", service: "Service", barber: "Barber", date: "Date", time: "Time",
    choose: "Select…", submit: "Confirm Booking", submitting: "Booking…",
    pickBarberDate: "Pick a barber and date to see times",
    taken: "Booked",
    success: "Booked! We'll see you on {date} at {time}.",
    errors: {
      name: "Please enter your name (2–100 characters).",
      phone: "Please enter a valid phone number.",
      service: "Please choose a service.",
      barber: "Please choose a barber.",
      date: "Please choose a date.",
      time: "Please choose a time.",
      slot_taken: "Sorry, that time was just taken. Please pick another.",
      past_slot: "That time has already passed.",
      generic: "Something went wrong. Please try again.",
    },
  },
  contact: {
    eyebrow: "Visit Us",
    title: "Find the shop",
    placeholder: "Placeholder business details — replace before launch",
    address: "Address", addressV: "123 Rainbow Street, Amman, Jordan",
    phone: "Phone", phoneV: "+962 7 0000 0000",
    hours: "Hours", hoursV: "Sat–Thu 10:00–22:00 · Fri 14:00–22:00",
    email: "Email", emailV: "hello@blackblade.example",
    whatsapp: "Chat on WhatsApp",
    map: "Map placeholder",
  },
  footer: { tagline: "Premium barbering for the modern gentleman.", rights: "All rights reserved.", links: "Explore", visit: "Visit" },
  admin: {
    title: "Admin Dashboard", signIn: "Admin sign in", signUp: "Create admin account", email: "Email", password: "Password",
    signInBtn: "Sign in", signUpBtn: "Sign up", toggleUp: "No account? Create one", toggleIn: "Have an account? Sign in",
    firstNote: "The first account created becomes the shop admin.",
    checkEmail: "Check your email to confirm your account, then sign in.",
    notAdmin: "This account doesn't have admin access.",
    signOut: "Sign out", appointments: "Appointments", services: "Services",
    customer: "Customer", status: "Status", actions: "Actions", edit: "Edit", cancel: "Cancel", save: "Save", delete: "Delete",
    complete: "Complete", none: "No appointments yet.", all: "All", upcoming: "Upcoming",
    statuses: { confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" },
    addService: "Add service", nameEn: "Name (EN)", nameAr: "Name (AR)", descEn: "Description (EN)", descAr: "Description (AR)",
    price: "Price", duration: "Duration (min)", active: "Active", updated: "Saved", backToSite: "Back to site",
    editAppt: "Edit appointment",
  },
};

type Dict = typeof en;

const ar: Dict = {
  nav: { about: "من نحن", services: "الخدمات", gallery: "المعرض", team: "الفريق", reviews: "الآراء", contact: "تواصل", book: "احجز الآن", admin: "الإدارة" },
  hero: {
    eyebrow: "منذ 2016 · عناية فاخرة",
    title1: "قصّات حادة.",
    title2: "حضور أقوى.",
    sub: "حلاقة دقيقة، طقوس المناشف الساخنة، وصالة مصممة للرجل الذي يهتم بمظهره.",
    cta: "احجز موعدك",
    cta2: "شاهد الخدمات",
  },
  about: {
    eyebrow: "قصتنا",
    title: "حيث تلتقي الحرفة بالشخصية",
    p1: "وُلدت بلاك بليد من فكرة بسيطة: قصة الشعر يجب أن تكون تجربة. يمزج حلاقونا التقنيات الكلاسيكية بالأسلوب العصري، ويأخذون الوقت لفهم شكل وجهك وأسلوب حياتك.",
    p2: "استقبال دافئ، قهوة قوية، وساعة مخصصة لك بالكامل.",
    stats: [["+10", "سنوات خبرة"], ["12 ألف", "قصة شعر"], ["4.9", "متوسط التقييم"]],
  },
  services: { eyebrow: "القائمة", title: "الخدمات والأسعار", min: "دقيقة", book: "احجز", currency: "د.أ" },
  gallery: { eyebrow: "أعمالنا", title: "من الكرسي مباشرة" },
  team: {
    eyebrow: "الحلاقون",
    title: "أسياد الموس",
    roles: { omar: "حلاق محترف · التدريج", karim: "مصفف أول · القصات الكلاسيكية", yousef: "المؤسس · الحلاقة واللحى" },
    bios: {
      omar: "معروف بالتدريج المثالي والتحديد الدقيق.",
      karim: "متخصص في العمل بالمقص مع حس عالٍ بالملمس.",
      yousef: "عشرون عاماً خلف الكرسي. الحلاقة الملكية توقيعه.",
    },
  },
  reviews: {
    eyebrow: "آراء العملاء",
    title: "ماذا يقول عملاؤنا",
    demo: "آراء تجريبية — محتوى توضيحي",
    items: [
      ["أفضل تدريج منذ سنوات. عمر فنان حقيقي.", "أحمد ر."],
      ["الحلاقة الملكية فخامة خالصة. تستحق كل دينار.", "ليث م."],
      ["نظافة واحترافية والتزام بالمواعيد. محلي المفضل.", "سامي ك."],
    ],
  },
  booking: {
    eyebrow: "الحجوزات",
    title: "احجز موعدك",
    sub: "اختر الخدمة والحلاق والوقت، وسنحجز لك الكرسي.",
    name: "الاسم الكامل", phone: "رقم الهاتف", service: "الخدمة", barber: "الحلاق", date: "التاريخ", time: "الوقت",
    choose: "اختر…", submit: "تأكيد الحجز", submitting: "جارٍ الحجز…",
    pickBarberDate: "اختر الحلاق والتاريخ لعرض الأوقات",
    taken: "محجوز",
    success: "تم الحجز! نراك يوم {date} الساعة {time}.",
    errors: {
      name: "يرجى إدخال الاسم (2–100 حرف).",
      phone: "يرجى إدخال رقم هاتف صحيح.",
      service: "يرجى اختيار الخدمة.",
      barber: "يرجى اختيار الحلاق.",
      date: "يرجى اختيار التاريخ.",
      time: "يرجى اختيار الوقت.",
      slot_taken: "عذراً، تم حجز هذا الوقت للتو. اختر وقتاً آخر.",
      past_slot: "هذا الوقت قد مضى.",
      generic: "حدث خطأ. حاول مرة أخرى.",
    },
  },
  contact: {
    eyebrow: "زورونا",
    title: "موقع المحل",
    placeholder: "بيانات تجريبية — يجب استبدالها قبل الإطلاق",
    address: "العنوان", addressV: "123 شارع الرينبو، عمّان، الأردن",
    phone: "الهاتف", phoneV: "+962 7 0000 0000",
    hours: "ساعات العمل", hoursV: "السبت–الخميس 10:00–22:00 · الجمعة 14:00–22:00",
    email: "البريد", emailV: "hello@blackblade.example",
    whatsapp: "تواصل عبر واتساب",
    map: "مكان الخريطة",
  },
  footer: { tagline: "حلاقة فاخرة للرجل العصري.", rights: "جميع الحقوق محفوظة.", links: "استكشف", visit: "زورونا" },
  admin: {
    title: "لوحة الإدارة", signIn: "دخول الإدارة", signUp: "إنشاء حساب إدارة", email: "البريد الإلكتروني", password: "كلمة المرور",
    signInBtn: "دخول", signUpBtn: "تسجيل", toggleUp: "لا تملك حساباً؟ أنشئ واحداً", toggleIn: "لديك حساب؟ سجّل الدخول",
    firstNote: "أول حساب يتم إنشاؤه يصبح مدير المحل.",
    checkEmail: "تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.",
    notAdmin: "هذا الحساب لا يملك صلاحيات الإدارة.",
    signOut: "خروج", appointments: "المواعيد", services: "الخدمات",
    customer: "العميل", status: "الحالة", actions: "إجراءات", edit: "تعديل", cancel: "إلغاء", save: "حفظ", delete: "حذف",
    complete: "إنهاء", none: "لا توجد مواعيد بعد.", all: "الكل", upcoming: "القادمة",
    statuses: { confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغى" },
    addService: "إضافة خدمة", nameEn: "الاسم (EN)", nameAr: "الاسم (AR)", descEn: "الوصف (EN)", descAr: "الوصف (AR)",
    price: "السعر", duration: "المدة (دقيقة)", active: "مفعّل", updated: "تم الحفظ", backToSite: "العودة للموقع",
    editAppt: "تعديل الموعد",
  },
};

const dicts = { en, ar };

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: "en", t: en, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("bb-lang");
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("bb-lang", l);
    setLangState(l);
  };
  return <Ctx.Provider value={{ lang, t: dicts[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const mins = 10 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});
