import { NextResponse } from "next/server";
import { hasOpenAI } from "@/lib/openai";
import { hasPersistentStore } from "@/lib/store";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "leadyaar",
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    openaiConfigured: hasOpenAI(),
    persistenceConfigured: hasPersistentStore(),
  });
}
