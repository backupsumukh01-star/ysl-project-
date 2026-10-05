import { NextResponse } from "next/server";
import { audienceDigestText, audienceReport } from "@/lib/analytics/audience";
import { sendOwnerEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";
  const header = request.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const report = await audienceReport();
  if (!report) return NextResponse.json({ success: false }, { status: 503 });
  const day = report.generatedAt.slice(0, 10);
  const text = audienceDigestText(report);
  const html = `<pre style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;">${text.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[char] || char)}</pre>`;
  await sendOwnerEmail({
    type: "audience_digest",
    dedupeKey: `audience_digest:${day}`,
    subject: `Shop activity ${day}`,
    html,
    text,
  });
  return NextResponse.json({ success: true });
}
