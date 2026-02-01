import { defineEventHandler, getQuery, createError } from "h3";

type Beds24Day = { i?: number; m?: number; o?: number; p1?: number };

function ymd(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
}

function isoFromYmd(yyyymmdd: string) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function monthRange(month: string) {
    const [yStr, mStr] = month.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!y || !m || m < 1 || m > 12) throw new Error("Invalid month");
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0); // last day of month
    return { fromYmd: ymd(from), toYmd: ymd(to) };
}

// basic in-memory cache to avoid hammering Beds24
const CACHE = new Map<string, { ts: number; data: any }>();
const TTL_MS = 5 * 60 * 1000;

export default defineEventHandler(async (event) => {
    const q = getQuery(event);
    const roomId = Number(q.roomId);
    const month = String(q.month || "");

    if (!roomId || !month) {
        throw createError({ statusCode: 400, statusMessage: "roomId and month are required" });
    }

    const config = useRuntimeConfig(event);
    const apiKey = config.beds24ApiKey as string | undefined;
    const propKey = config.beds24PropKey as string | undefined;

    if (!apiKey || !propKey) {
        throw createError({ statusCode: 500, statusMessage: "Missing BEDS24_API_KEY or BEDS24_PROP_KEY" });
    }

    const cacheKey = `${roomId}:${month}`;
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;

    let fromYmd: string, toYmd: string;
    try {
        ({ fromYmd, toYmd } = monthRange(month));
    } catch {
        throw createError({ statusCode: 400, statusMessage: "month must be YYYY-MM" });
    }

    const payload = {
        authentication: { apiKey, propKey },
        roomId,
        from: fromYmd,
        to: toYmd,
        incOverride: 1,
        incMaxStay: 1,
        allowInventoryNegative: 0,
    };

    const resp = await fetch("https://api.beds24.com/json/getRoomDates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!resp.ok) {
        throw createError({ statusCode: 502, statusMessage: `Beds24 error: ${resp.status}` });
    }

    const json = await resp.json();

    const days: Array<{
        date: string;
        available: boolean;
        inventory: number;
        minStay: number;
        noCheckin: boolean;
        noCheckout: boolean;
        blackout: boolean;
        price: number | null;
    }> = [];

    for (const [k, v] of Object.entries(json || {})) {
        const d = v as Beds24Day;

        const inventory = Number(d.i ?? 0);
        const minStay = Number(d.m ?? 1);
        const override = Number(d.o ?? 0);

        // Common Beds24 override interpretation:
        // 1 blackout, 2 no checkin, 3 no checkout, 4 both
        const blackout = override === 1;
        const noCheckin = override === 2 || override === 4;
        const noCheckout = override === 3 || override === 4;

        const available = inventory > 0 && !blackout;
        const price = d.p1 == null ? null : Number(d.p1);

        days.push({
            date: isoFromYmd(k),
            available,
            inventory,
            minStay,
            noCheckin,
            noCheckout,
            blackout,
            price,
        });
    }

    days.sort((a, b) => a.date.localeCompare(b.date));

    const out = { roomId, month, days };
    CACHE.set(cacheKey, { ts: Date.now(), data: out });
    return out;
});
