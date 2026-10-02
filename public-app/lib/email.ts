// Sends an email alert to the site owner through Resend (https://resend.com).
// Does nothing unless RESEND_API_KEY and ADMIN_NOTIFY_EMAIL are set, and never
// throws, so a failed email can never break a customer's submission.
export async function notifyAdminByEmail(subject: string, lines: Record<string, string | null | undefined>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const from = process.env.RESEND_FROM ?? "DMN Solutions <onboarding@resend.dev>";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  const text = [
    ...Object.entries(lines)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`),
    adminUrl ? `\nOpen the admin: ${adminUrl}` : "",
  ]
    .join("\n")
    .trim();

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((e) => e.trim()), subject, text }),
    });
  } catch {
    // ignore: email is best-effort
  }
}
