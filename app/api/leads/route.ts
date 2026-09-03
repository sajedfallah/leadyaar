import { NextResponse } from "next/server";
import { createAIResponse, hasOpenAI } from "@/lib/openai";
import { resolveRequestUser } from "@/lib/telegram";
import type { BusinessProfile } from "@/app/api/business/route";

export const runtime = "nodejs";

export type Lead = {
  name: string;
  field: string;
  reason: string;
  score: number;
  contact?: string;
  source?: string;
};

function demoLeads(profile: BusinessProfile): Lead[] {
  const location = profile.location || "منطقه شما";
  const names = ["آریا صنعت", "بازرگانی پارس", "صنایع کویر", "پیشگام تجارت", "توسعه بازار", "راهکار صنعت", "پارس تجهیز", "نوین بازرگان", "آتیه تجارت", "سپهر تولید"];
  return names.map((name, index) => ({
    name: `${name} — ${location}`,
    field: profile.customerType === "consumer" ? "مشتری بالقوه محلی" : "شرکت بالقوه هدف",
    reason: `براساس خدمت «${profile.offer}» و محدوده «${location}» برای بررسی و تماس اولیه در اولویت قرار گرفته است.`,
    score: Math.max(62, 93 - index * 3),
    contact: "در نسخه متصل به جست‌وجوی وب تکمیل می‌شود",
    source: "Demo data",
  }));
}

function parseJsonArray(text: string): Lead[] | null {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) return null;
    return parsed.slice(0, 10).map((item) => ({
      name: String(item.name ?? "Lead"),
      field: String(item.field ?? ""),
      reason: String(item.reason ?? ""),
      score: Math.min(100, Math.max(0, Number(item.score) || 70)),
      contact: item.contact ? String(item.contact) : undefined,
      source: item.source ? String(item.source) : undefined,
    }));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    resolveRequestUser(request);
    const profile = (await request.json()) as BusinessProfile;
    if (!profile.business || !profile.offer || !profile.location) {
      return NextResponse.json({ ok: false, error: "Business profile required" }, { status: 400 });
    }

    if (!hasOpenAI()) return NextResponse.json({ ok: true, leads: demoLeads(profile), mode: "demo" });

    const output = await createAIResponse({
      webSearch: true,
      maxOutputTokens: 3200,
      instructions: "You are LeadYar's B2B/B2C lead researcher. Search only public web sources. Never invent companies, contact details, or source URLs. Return ONLY a valid JSON array with exactly 10 objects. Keys: name, field, reason, score (0-100), contact, source. Source must be a public URL when available. If evidence is insufficient, omit the lead instead of inventing it.",
      input: `Business: ${profile.business}\nOffer: ${profile.offer}\nCustomer type: ${profile.customerType}\nTarget location: ${profile.location}\nFind the best real prospective customers that plausibly need this offer.`,
    });

    const leads = output ? parseJsonArray(output) : null;
    return NextResponse.json({ ok: true, leads: leads?.length ? leads : demoLeads(profile), mode: leads?.length ? "live" : "fallback" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Lead search failed" }, { status: 500 });
  }
}
