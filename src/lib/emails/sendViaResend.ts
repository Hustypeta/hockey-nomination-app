export type ResendSendPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendViaResend(payload: ResendSendPayload): Promise<{ id?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const replyTo = (process.env.RESEND_REPLY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const listUnsubMailto =
    process.env.RESEND_LIST_UNSUBSCRIBE_MAILTO?.trim() || replyTo[0] || "info@hokejlineup.cz";

  if (!apiKey) throw new Error("Missing env RESEND_API_KEY");
  if (!from) throw new Error("Missing env RESEND_FROM");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      ...(replyTo.length ? { reply_to: replyTo } : {}),
      headers: {
        "List-Unsubscribe": `<mailto:${listUnsubMailto}?subject=unsubscribe>`,
      },
      text: payload.text,
      html: payload.html,
    }),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${body}`);
  try {
    return JSON.parse(body) as { id?: string };
  } catch {
    return {};
  }
}
