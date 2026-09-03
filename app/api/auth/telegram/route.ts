import { NextResponse } from "next/server";
import { resolveRequestUser, validateTelegramInitData } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { initData?: string };
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const auth = botToken && body.initData
      ? validateTelegramInitData(body.initData, botToken)
      : resolveRequestUser(request);

    return NextResponse.json({ ok: true, ...auth });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 401 },
    );
  }
}
