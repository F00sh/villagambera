import { defineEventHandler, getQuery, createError } from "h3";

export default defineEventHandler(async (event) => {
  const secret = process.env.WEBHOOK_SECRET || "";
  const q = getQuery(event);
  const provided = (q.secret as string | undefined) || (event.node.req.headers["x-webhook-secret"] as string | undefined);

  if (secret && (!provided || provided !== secret)) {
    throw createError({ statusCode: 403, statusMessage: "Invalid webhook secret" });
  }

  console.log("[Beds24 webhook:GET]", {
    headers: {
      "user-agent": event.node.req.headers["user-agent"],
      "x-forwarded-for": event.node.req.headers["x-forwarded-for"],
    },
    query: q,
  });

  return { ok: true };
});

