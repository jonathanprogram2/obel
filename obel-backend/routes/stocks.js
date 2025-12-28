const router = require("express").Router();
const axios = require("axios");
const { error } = require("console");


const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

console.log(
    "🔑 FINNHUB_API_KEY loaded?",
    !!FINNHUB_API_KEY ? "YES" : "NO"
);

if (!FINNHUB_API_KEY) {
    console.warn("⚠️ FINNHUB_API_KEY missing - /api/stocks routes will fail.");
}

// Normalize Finnhub's /quote response
// Doc fields: c=current, d=change, dp=change %, h/L/o=hi/lo/open, pc=prev close, t=timestamp
function parseFinnhubQuote(raw, symbol) {
    if (!raw || typeof raw.c === "undefined") return null;
    
    return {
        symbol,
        price: typeof raw.c === "number" ? raw.c : null,
        change: typeof raw.d === "number" ? raw.d : null,
        changePercent:
            typeof raw.dp === "number" ? `${raw.dp.toFixed(2)}%` : null,
        previousClose: typeof raw.pc === "number" ? raw.pc : null,
        volume: typeof raw.v === "number" ? raw.v : null,
    };
}

// DEFAULT watchlist for now  (THIS CAN BE TWEAKED IN THE FUTURE)
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "SPY", "QQQ"];

router.get("/watchlist", async (req, res) => {
    if (!FINNHUB_API_KEY) {
        return res
            .status(500)
            .json({ error: "Missing FINNHUB_API_KEY in backend .env" });
    }

    // Allow ?symbols=AAPL,MSFT override, otherwise default list
    const symbolsParam = req.query.symbols;
    const symbols = symbolsParam
        ? symbolsParam
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean)
        : DEFAULT_SYMBOLS;

    try {
        const requests = symbols.map((symbol) => 
            axios.get("https://finnhub.io/api/v1/quote", {
                params: {
                    symbol,
                    token: FINNHUB_API_KEY,
                },
            })
        );

        const responses = await Promise.all(requests);

        const quotes = responses
            .map((resp, idx) => parseFinnhubQuote(resp.data, symbols[idx]))
            .filter(Boolean);

        if (!quotes.length) {
            console.warn(
                "⚠️ /api/stocks/watchlist — Finnhub returned no quotes. Sample response:",
                responses[0]?.data
            );
        }

        return res.json({
            asOf: new Date().toISOString(),
            symbols,
            quotes,
        });
    } catch (err) {
        console.error(
            "❌ /api/stocks/watchlist error:",
            err.response?.data || err.message
        );
        return res.status(500).json({
            error: "Failed to fetch watchlist quotes.",
            details: err.response?.data || null,
        });
    }
});

// ------------------ STOCK DETAIL (FINNHUB) ------------------- //

/**
 * Small helper: to convert Finnhub quote payload to the shape
 */
function parseFinnhubQuote(raw, symbol) {
    if (!raw || typeof raw.c !== "number") return null;

    return {
        symbol,
        price: raw.c,    // current price
        change: raw.d,   // absolute change
        changePercent: raw.dp,   // % change
        high: raw.h,            // high of the day
        low: raw.l,             // low of the day
        open: raw.o,            // open price
        previousClose: raw.pc,  // previous close
        timestamp: raw.t || null,  // last update (unix seconds)
    };
}

router.get("/detail/:symbol", async (req, res) => {
    if (!FINNHUB_API_KEY) {
        return res.status(500).json({
            error: "Missing FINNHUB_API_KEY in backend .env",
        });
    }

    const symbol = req.params.symbol.toUpperCase();

    // simple 7-day window for recent company news
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - 7);
    const from = fromDate.toISOString().slice(0, 10);

    try {
        const [quoteRes, profileRes, metricsRes, newsRes] = await Promise.all([
            axios.get("https://finnhub.io/api/v1/quote", {
                params: { symbol, token: FINNHUB_API_KEY },
            }),
            axios.get("https://finnhub.io/api/v1/stock/profile2", {
                params: { symbol, token: FINNHUB_API_KEY },
            }),
            axios.get("https://finnhub.io/api/v1/stock/metric", {
                params: { symbol, metric: "all", token: FINNHUB_API_KEY },
            }),
            axios.get("https://finnhub.io/api/v1/company-news", {
                params: { symbol, from, to, token: FINNHUB_API_KEY },
            }),
        ]);

        const quote = parseFinnhubQuote(quoteRes.data, symbol);
        const profile = profileRes.data || {};
        const metricRoot = metricsRes.data || {};
        const metric = metricRoot.metric || {};

        const summaryParts = [];
        if (profile.finnhubIndustry) summaryParts.push(profile.finnhubIndustry);
        if (profile.country) summaryParts.push(`based in ${profile.country}`);
        if (profile.marketCapitalization) {
            summaryParts.push(
                `approx. market cap ~$${profile.marketCapitalization.toFixed(1)}B`
            );
        }

        let description = null;
        if (summaryParts.length) {
            description = `${profile.name || symbol} is a ${summaryParts.join(", ")}.`;
        }

        const news = Array.isArray(newsRes.data)
            ? newsRes.data.slice(0, 5).map((n) => ({
                    id: n.id || n.url,
                    headline: n.headline,
                    source: n.source,
                    url: n.url,
                    summary: n.summary,
                    datetime: n.datetime, // unix seconds
                }))
            : [];

        return res.json({
            symbol,
            asOf: new Date().toISOString(),
            quote,
            profile: {
                name: profile.name || symbol,
                ticker: profile.ticker || symbol,
                exchange: profile.exchange || null,
                currency: profile.currency || "USD",
                marketCap: profile.marketCapitalization || null,
                industry: profile.finnhubIndustry || null,
                country: profile.country || null,
                logo: profile.logo || null,
                weburl: profile.weburl || null,
                description,
            },
            metrics: {
                peTTM: metric.peTTM ?? null,
                epsTTM: metric.epsTTM ?? null,
                roeTTM: metric.roeTTM ?? null,
                netMargin: metric.netMargin ?? null,
                week52High: metric["52WeekHigh"] ?? null,
                week52Low: metric["52WeekLow"] ?? null,
                week52Return: metric["52WeekPriceReturnDaily"] ?? null,
            },
            news,
        });
    } catch (err) {
        console.error(
            "❌ /api/stocks/detail error:",
            err.response?.data || err.message
        );
        return res.status(500).json({
            error: "Failed to fetch stock detail.",
            details: err.response?.data || null,
        });
    }
});

module.exports = router;