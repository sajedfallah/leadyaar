import { NextResponse } from "next/server";
import { getJson, hasPersistentStore, setJson } from "@/lib/store";
import { resolveRequestUser } from "@/lib/telegram";

export const runtime = "nodejs";

export type BusinessProfile = {
  business: string;
  offer: string;
  customerType: "company" | "consumer" | "both";
  location: string;
  currentCustomers: number;
  targetCustomers: number;
  averageValue?: number;
};

function keyFor(id: number) {
  return `leadyaar:business:${id}`;
}

export async function GET(request: Request) {
  try {
    const auth = resolveRequestUser(request);
    const profile = await getJson<BusinessProfile>(keyFor(auth.user.id));
    return NextResponse.json({ ok: true, profile, persistent: hasPersistentStore(), demo: auth.demo });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = resolveRequestUser(request);
    const profile = (await request.json()) as BusinessProfile;
    if (!profile.business?.trim() || !profile.offer?.trim() || !profile.location?.trim()) {
      return NextResponse.json({ ok: false, error: "اطلاعات کسب‌وکار ناقص است." }, { status: 400 });
    }
    const persistent = await setJson(keyFor(auth.user.id), profile);
    return NextResponse.json({ ok: true, profile, persistent, demo: auth.demo });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unable to save profile" }, { status: 401 });
  }
}
