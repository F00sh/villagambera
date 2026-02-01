// server/api/beds24/create-booking.post.ts
import { defineEventHandler, readBody, createError } from "h3";

function isoToLocalDate(iso: string) {
  return new Date(iso + "T00:00:00");
}
function localDateToISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.roomId || !body?.arrival || !body?.departure || !body?.numAdult) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId, arrival, departure or numAdult" });
  }

  const apiKey = process.env.BEDS24_API_KEY;
  const propKey = process.env.BEDS24_PROP_KEY;
  if (!apiKey || !propKey) {
    throw createError({ statusCode: 500, statusMessage: "Server missing Beds24 API keys (BEDS24_API_KEY/BEDS24_PROP_KEY)" });
  }

  const firstNight: string = body.arrival;
  // lastNight is the night before departure
  const dep = isoToLocalDate(body.departure);
  dep.setDate(dep.getDate() - 1);
  const lastNight: string = localDateToISO(dep);

  const payload = {
    authentication: { apiKey, propKey },
    // Actions (documented by Beds24)
    checkAvailability: true,
    assignBooking: true,

    // Booking core (aligns to Beds24 sample JSON)
    roomId: String(body.roomId),
    roomQty: "1",
    status: "1",
    firstNight,
    lastNight,
    numAdult: String(body.numAdult ?? 1),
    numChild: String(body.numChild ?? 0),

    // Guest details (Beds24 field names)
    guestTitle: body.guest?.title || "",
    guestFirstName: body.guest?.firstName || "",
    guestName: body.guest?.lastName || "",
    guestEmail: body.guest?.email || "",
    guestPhone: body.guest?.phone || "",
    guestMobile: body.guest?.mobile || "",
    guestAddress: body.guest?.address || "",
    guestCity: body.guest?.city || "",
    guestPostcode: body.guest?.postcode || "",
    guestCountry: body.guest?.country || "",
    guestArrivalTime: body.guest?.arrivalTime || "",
    guestComments: body.guest?.comments || "",
  };

  const res: any = await $fetch("https://api.beds24.com/json/setBooking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  // Try common locations for a new booking id
  const bookId = res?.bookId ?? res?.newBookId ?? res?.data?.bookId ?? res?.result?.bookId;

  if (!bookId) {
    throw createError({ statusCode: 500, statusMessage: "Beds24 did not return a booking id." });
  }

  return {
    bookId,
    payUrl: `https://beds24.com/bookpay.php?bookid=${encodeURIComponent(String(bookId))}`,
  };
});
