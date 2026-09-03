"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: { first_name?: string; username?: string } };
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  HapticFeedback?: { impactOccurred?: (style: string) => void };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

type BusinessProfile = {
  business: string;
  offer: string;
  customerType: "company" | "consumer" | "both";
  location: string;
  currentCustomers: number;
  targetCustomers: number;
  averageValue?: number;
};

type Lead = {
  name: string;
  field: string;
  reason: string;
  score: number;
  contact?: string;
  source?: string;
};

type Tab = "home" | "leads" | "pipeline" | "ai" | "account";

const EMPTY_PROFILE: BusinessProfile = {
  business: "",
  offer: "",
  customerType: "company",
  location: "",
  currentCustomers: 0,
  targetCustomers: 0,
  averageValue: undefined,
};

function telegramHeaders() {
  const initData = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData ?? "" : "";
  return initData ? { "x-telegram-init-data": initData } : {};
}

async function api<T>(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...telegramHeaders(),
      ...(options.headers ?? {}),
    },
  });
  const data = (await response.json()) as T & { ok?: boolean; error?: string };
  if (!response.ok) throw new Error(data.error || "درخواست ناموفق بود");
  return data;
}

export default function Home() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [draft, setDraft] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [tab, setTab] = useState<Tab>("home");
  const [userName, setUserName] = useState("کاربر لیدیار");
  const [authMode, setAuthMode] = useState<"loading" | "telegram" | "demo">("loading");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadMode, setLeadMode] = useState("demo");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [coachMessage, setCoachMessage] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [contacted, setContacted] = useState<string[]>([]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    tg?.setHeaderColor?.("#f4f7fb");

    const local = localStorage.getItem("leadyaar-business");
    if (local) {
      try {
        const parsed = JSON.parse(local) as BusinessProfile;
        setProfile(parsed);
        setDraft(parsed);
      } catch {
        localStorage.removeItem("leadyaar-business");
      }
    }

    const auth = async () => {
      try {
        const result = await api<{ user: { first_name: string; username?: string }; demo: boolean }>("/api/auth/telegram", {
          method: "POST",
          body: JSON.stringify({ initData: tg?.initData ?? "" }),
        });
        setUserName(result.user.first_name || result.user.username || "کاربر");
        setAuthMode(result.demo ? "demo" : "telegram");
      } catch {
        setAuthMode("demo");
      }
    };
    void auth();
  }, []);

  useEffect(() => {
    if (!profile) return;
    void loadLeads(profile);
  }, [profile]);

  const progress = useMemo(() => {
    if (!profile?.targetCustomers) return 0;
    return Math.min(100, Math.round((profile.currentCustomers / profile.targetCustomers) * 100));
  }, [profile]);

  async function loadLeads(current: BusinessProfile) {
    setLoadingLeads(true);
    try {
      const result = await api<{ leads: Lead[]; mode: string }>("/api/leads", {
        method: "POST",
        body: JSON.stringify(current),
      });
      setLeads(result.leads);
      setLeadMode(result.mode);
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!draft.business || !draft.offer || !draft.location || draft.targetCustomers <= 0) return;
    setProfile(draft);
    localStorage.setItem("leadyaar-business", JSON.stringify(draft));
    try {
      await api("/api/business", { method: "POST", body: JSON.stringify(draft) });
    } catch {
      // Browser storage remains the offline/demo fallback.
    }
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
  }

  async function askCoach(event: FormEvent) {
    event.preventDefault();
    if (!coachMessage.trim()) return;
    setCoachLoading(true);
    try {
      const result = await api<{ answer: string }>("/api/ai/coach", {
        method: "POST",
        body: JSON.stringify({ message: coachMessage, profile }),
      });
      setCoachAnswer(result.answer);
    } catch (error) {
      setCoachAnswer(error instanceof Error ? error.message : "خطا در ارتباط با دستیار فروش");
    } finally {
      setCoachLoading(false);
    }
  }

  if (!profile) {
    return (
      <main className="shell onboardingShell">
        <header className="brandbar">
          <div className="logo">ل</div>
          <div><strong>لیدیار</strong><span>راه‌اندازی کسب‌وکار</span></div>
        </header>
        <section className="card onboarding">
          <p className="eyebrow">شروع در کمتر از ۲ دقیقه</p>
          <h1>مشتری بعدی‌ات را پیدا کن</h1>
          <p className="muted">اطلاعات اولیه را وارد کن تا برنامه جذب مشتری مخصوص کسب‌وکارت ساخته شود.</p>
          <form onSubmit={saveProfile} className="formGrid">
            <label>زمینه فعالیت<input value={draft.business} onChange={(e) => setDraft({ ...draft, business: e.target.value })} placeholder="مثلاً ترخیص کالا" required /></label>
            <label>محصول یا خدمت<input value={draft.offer} onChange={(e) => setDraft({ ...draft, offer: e.target.value })} placeholder="دقیقاً چه چیزی می‌فروشی؟" required /></label>
            <label>نوع مشتری<select value={draft.customerType} onChange={(e) => setDraft({ ...draft, customerType: e.target.value as BusinessProfile["customerType"] })}><option value="company">شرکت‌ها</option><option value="consumer">افراد</option><option value="both">هر دو</option></select></label>
            <label>محدوده فعالیت<input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="مثلاً یزد و بندرعباس" required /></label>
            <div className="twoCols">
              <label>مشتری فعلی / ماه<input type="number" min="0" value={draft.currentCustomers} onChange={(e) => setDraft({ ...draft, currentCustomers: Number(e.target.value) })} /></label>
              <label>هدف / ماه<input type="number" min="1" value={draft.targetCustomers} onChange={(e) => setDraft({ ...draft, targetCustomers: Number(e.target.value) })} required /></label>
            </div>
            <label>ارزش متوسط هر فروش (اختیاری)<input type="number" min="0" value={draft.averageValue ?? ""} onChange={(e) => setDraft({ ...draft, averageValue: e.target.value ? Number(e.target.value) : undefined })} placeholder="تومان" /></label>
            <button className="primary" type="submit">ساخت برنامه من</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="brandbar">
        <div className="logo">ل</div>
        <div className="brandcopy"><strong>لیدیار</strong><span>{authMode === "telegram" ? `متصل به تلگرام · ${userName}` : `حالت دمو · ${userName}`}</span></div>
        <button className="iconButton" onClick={() => void loadLeads(profile)} aria-label="refresh">↻</button>
      </header>

      {tab === "home" && <>
        <section className="hero card">
          <div><p className="eyebrow">هدف این ماه</p><h1>{profile.currentCustomers} / {profile.targetCustomers} مشتری</h1><p>{Math.max(0, profile.targetCustomers - profile.currentCustomers)} مشتری دیگر تا هدف ماهانه</p></div>
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>
        </section>
        <section>
          <div className="sectionTitle"><h2>برنامه امروز</h2><span>{profile.location}</span></div>
          <div className="stats"><article className="card"><b>۱۰</b><span>لید جدید</span></article><article className="card"><b>{contacted.length}</b><span>تماس ثبت‌شده</span></article><article className="card"><b>{Math.max(0, 5 - contacted.length)}</b><span>پیگیری پیشنهادی</span></article></div>
          <button className="primary" onClick={() => setTab("leads")}>شروع کار امروز</button>
        </section>
        <section>
          <div className="sectionTitle"><h2>لیدهای پیشنهادی</h2><button onClick={() => setTab("leads")}>مشاهده همه</button></div>
          <LeadList leads={leads.slice(0, 3)} contacted={contacted} onContact={(name) => setContacted((old) => old.includes(name) ? old : [...old, name])} loading={loadingLeads} />
        </section>
        <section className="insight card"><div className="spark">✦</div><div><p className="eyebrow">تحلیل لیدیار</p><strong>{leadMode === "live" ? "لیدهای امروز از منابع عمومی وب استخراج شده‌اند." : "نسخه دمو فعال است؛ با تنظیم OpenAI، جست‌وجوی واقعی وب فعال می‌شود."}</strong></div></section>
      </>}

      {tab === "leads" && <section><div className="pageHead"><p className="eyebrow">امروز</p><h1>مشتریان بالقوه</h1><p className="muted">اولویت‌ها براساس کسب‌وکار و منطقه فعالیت شما مرتب شده‌اند.</p></div><LeadList leads={leads} contacted={contacted} onContact={(name) => setContacted((old) => old.includes(name) ? old : [...old, name])} loading={loadingLeads} /></section>}

      {tab === "pipeline" && <section><div className="pageHead"><p className="eyebrow">Pipeline</p><h1>مسیر فروش</h1></div><div className="pipeline"><article className="card"><b>{leads.length}</b><span>لید جدید</span></article><article className="card"><b>{contacted.length}</b><span>تماس گرفته شد</span></article><article className="card"><b>0</b><span>مذاکره</span></article><article className="card"><b>0</b><span>پیشنهاد</span></article><article className="card"><b>{profile.currentCustomers}</b><span>مشتری فعلی</span></article></div></section>}

      {tab === "ai" && <section><div className="pageHead"><p className="eyebrow">AI Sales Coach</p><h1>دستیار فروش من</h1><p className="muted">اعتراض مشتری، متن تماس، پیگیری یا استراتژی را بپرس.</p></div><form onSubmit={askCoach} className="coach card"><textarea value={coachMessage} onChange={(e) => setCoachMessage(e.target.value)} placeholder="مثلاً مشتری گفت تأمین‌کننده فعلی داریم؛ چه جوابی بدهم؟" rows={5} /><button className="primary" disabled={coachLoading}>{coachLoading ? "در حال تحلیل..." : "پرسیدن از لیدیار"}</button>{coachAnswer && <div className="answer">{coachAnswer}</div>}</form></section>}

      {tab === "account" && <section><div className="pageHead"><p className="eyebrow">پروفایل</p><h1>{profile.business}</h1></div><article className="card accountCard"><p><b>خدمت:</b> {profile.offer}</p><p><b>منطقه:</b> {profile.location}</p><p><b>هدف:</b> {profile.targetCustomers} مشتری در ماه</p><button className="secondary" onClick={() => { localStorage.removeItem("leadyaar-business"); setProfile(null); setDraft(EMPTY_PROFILE); }}>ویرایش اطلاعات کسب‌وکار</button></article></section>}

      <nav className="nav">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>خانه</button>
        <button className={tab === "leads" ? "active" : ""} onClick={() => setTab("leads")}>لیدها</button>
        <button className={tab === "pipeline" ? "active" : ""} onClick={() => setTab("pipeline")}>Pipeline</button>
        <button className={tab === "ai" ? "active" : ""} onClick={() => setTab("ai")}>AI</button>
        <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>حساب من</button>
      </nav>
    </main>
  );
}

function LeadList({ leads, contacted, onContact, loading }: { leads: Lead[]; contacted: string[]; onContact: (name: string) => void; loading: boolean }) {
  if (loading) return <div className="card empty">در حال پیدا کردن لیدهای مناسب...</div>;
  if (!leads.length) return <div className="card empty">هنوز لیدی پیدا نشده است.</div>;
  return <div className="leadList">{leads.map((lead) => <article className="lead card" key={lead.name}><div className="leadTop"><div className="score">{lead.score}</div><div className="leadText"><strong>{lead.name}</strong><span>{lead.field}</span></div><em>{contacted.includes(lead.name) ? "تماس شد" : "اولویت"}</em></div><p>{lead.reason}</p>{lead.contact && <small>{lead.contact}</small>}<div className="leadActions"><button className="secondary" onClick={() => onContact(lead.name)}>{contacted.includes(lead.name) ? "ثبت شد ✓" : "تماس گرفتم"}</button>{lead.source && lead.source.startsWith("http") && <a href={lead.source} target="_blank" rel="noreferrer">منبع ↗</a>}</div></article>)}</div>;
}
