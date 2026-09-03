import { NextResponse } from "next/server";
import { createAIResponse, hasOpenAI } from "@/lib/openai";
import { resolveRequestUser } from "@/lib/telegram";
import type { BusinessProfile } from "@/app/api/business/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    resolveRequestUser(request);
    const body = (await request.json()) as { message?: string; profile?: BusinessProfile };
    if (!body.message?.trim()) return NextResponse.json({ ok: false, error: "پیام خالی است." }, { status: 400 });

    if (!hasOpenAI()) {
      return NextResponse.json({
        ok: true,
        mode: "demo",
        answer: "نسخه AI هنوز کلید OpenAI ندارد. برای این مرحله پیشنهاد می‌کنم هدف تماس اول را گرفتن اطلاعات و مشخص‌کردن نیاز واقعی مشتری بگذارید، نه فروش فوری. سپس نتیجه تماس را ثبت و زمان پیگیری مشخص کنید.",
      });
    }

    const profile = body.profile;
    const answer = await createAIResponse({
      maxOutputTokens: 900,
      instructions: "You are LeadYar, a concise Persian sales coach. Give concrete next actions, suggested wording, and follow-up advice. Do not fabricate facts about a prospect. Keep the response practical and under 250 Persian words.",
      input: `Business profile: ${JSON.stringify(profile ?? {})}\nUser question: ${body.message}`,
    });

    return NextResponse.json({ ok: true, mode: "live", answer: answer || "پاسخی دریافت نشد." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "AI request failed" }, { status: 500 });
  }
}
