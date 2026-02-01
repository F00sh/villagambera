import { defineEventHandler, getQuery, readBody, createError } from "h3";

export default defineEventHandler(async (event) => {
  const secret = process.env.WEBHOOK_SECRET || "";
  const q = getQuery(event);
  const hdrSecret = event.node.req.headers["x-webhook-secret"] as string | undefined;
  const body: any = await readBody(event).catch(() => ({}));

  const provided = (q.secret as string | undefined) || hdrSecret || body?.secret;
  if (secret && (!provided || provided !== secret)) {
    throw createError({ statusCode: 403, statusMessage: "Invalid webhook secret" });
  }

  // Log a concise summary to serverless logs for diagnostics
  console.log("[Beds24 webhook:POST]", {
    headers: {
      "user-agent": event.node.req.headers["user-agent"],
      "x-forwarded-for": event.node.req.headers["x-forwarded-for"],
    },
    query: q,
    body: body && Object.keys(body).length ? body : null,
  });

  // Respond OK so Beds24 does not retry
  return { ok: true };
});

