import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function parseUserAgent(ua: string) {
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const browser = /Chrome/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : /Firefox/i.test(ua) ? "Firefox" : "Other";
  const os = /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Android/i.test(ua) ? "Android" : /iOS|iPhone/i.test(ua) ? "iOS" : "Other";
  return { device_category: isMobile ? "mobile" : "desktop", browser, os };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.sessionId || !body?.path) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const ua = request.headers.get("user-agent") ?? "";
  const { device_category, browser, os } = parseUserAgent(ua);

  const existing = await supabase
    .from("visitor_sessions")
    .select("id")
    .eq("session_token", body.sessionId)
    .maybeSingle();
  const existingRow = existing.data as { id: string } | null;
  let sessionRowId: string | undefined = existingRow?.id;

  if (!sessionRowId) {
    const inserted = await supabase
      .from("visitor_sessions")
      .insert({ session_token: body.sessionId, device_category, browser, os, referrer: body.referrer ?? null })
      .select("id")
      .maybeSingle();
    const insertedRow = inserted.data as { id: string } | null;
    sessionRowId = insertedRow?.id;
  } else {
    await supabase.from("visitor_sessions").update({ last_seen: new Date().toISOString() }).eq("id", sessionRowId);
  }

  if (sessionRowId) {
    await supabase.from("page_views").insert({ session_id: sessionRowId, path: body.path });
  }

  return NextResponse.json({ ok: true });
}
