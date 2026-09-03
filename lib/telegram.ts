import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramAuthResult = {
  user: TelegramUser;
  authDate: number;
  demo: boolean;
};

function safeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 24 * 60 * 60,
): TelegramAuthResult {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) throw new Error("Telegram hash is missing");

  const entries = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (!safeEqualHex(calculatedHash, receivedHash)) throw new Error("Invalid Telegram signature");

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) throw new Error("Telegram auth_date is missing");
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - authDate) > maxAgeSeconds) throw new Error("Telegram init data is expired");

  const rawUser = params.get("user");
  if (!rawUser) throw new Error("Telegram user is missing");
  const user = JSON.parse(rawUser) as TelegramUser;
  if (!user.id || !user.first_name) throw new Error("Telegram user is invalid");

  return { user, authDate, demo: false };
}

export function resolveRequestUser(request: Request): TelegramAuthResult {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const initData = request.headers.get("x-telegram-init-data") ?? "";

  if (botToken && initData) return validateTelegramInitData(initData, botToken);

  const demoAllowed = process.env.ALLOW_DEMO_MODE === "true" || !botToken;
  if (demoAllowed) {
    return {
      user: { id: 1, first_name: "کاربر", username: "leadyaar_demo" },
      authDate: Math.floor(Date.now() / 1000),
      demo: true,
    };
  }

  throw new Error("Telegram authentication required");
}
