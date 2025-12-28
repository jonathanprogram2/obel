const router = require("express").Router();
const axios = require("axios");

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
    console.warn("⚠️ FINNHUB_API_KEY missing - /api/flows/daily-market will fail.");
}

// ---- Helpers --------------------------
// Normalize Finnhub quote payload
function parseFinnhubQuote(raw, symbol) {
    if (!raw || typeof raw !== "object") return null;

    const price = typeof raw.c === "number" ? raw.c : null;
    const change = typeof raw.d === "number" ? raw.d : null;
    const dp = typeof raw.dp === "number" ? raw.dp : null;

    return {
        symbol,
        price,
        change,
        changePercent:
            dp != null && !Number.isNaN(dp) ? `${dp.toFixed(2)}%` : null,
        changePercentNumeric:
            dp != null && !Number.isNaN(dp) ? dp : null,
        previousClose: typeof raw.pc === "number" ? raw.pc : null,
    };
}

function mapQuoteToMover(q) {
    return {
        ticker: q.symbol,
        price: q.price != null ? q.price.toString() : null,
        change_amount: q.change != null ? q.change.toString() : null,
        change_percentage:
            q.changePercentNumeric != null
                ? q.changePercentNumeric.toString()
                : null,
        volume: q.volume != null ? q.volume.toString() : null, // Finnhub /quote doesn't include volume; placeholder
    };
}


// --------- ROUTES ---------------------------------

// GET / api/flows/daily-market
router.get("/daily-market", async (req, res) => {
    if (!FINNHUB_API_KEY) {
        return res.status(500).json({
            error: "Server missing FINNHUB_API_KEY. Set it in .env.",
        });
    }

    // First two are your "index proxies"
    // the rest are used to build gainers/losers/actives from a core universe.
    const symbols = [
        "SPY",
        "QQQ",
        "AAPL",
        "MSFT",
        "NVDA",
        "TSLA",
        "AMZN",
        "META",
        "GOOGL",
        "NFLX",
    ];

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

        const indices = quotes.slice(0, 2); // SPY, QQQ
        const universe = quotes.slice(2); // rest for movers

        const validUniverse = universe.filter(
            (q) =>
                q.price != null && q.changePercentNumeric != null
        );

        const gainers = validUniverse
            .filter((q) => q.changePercentNumeric > 0)
            .sort(
                (a, b) =>
                    b.changePercentNumeric - a.changePercentNumeric
            )
            .slice(0, 5)
            .map(mapQuoteToMover);

        const losers = validUniverse
            .filter((q) => q.changePercentNumeric < 0)
            .sort(
                (a, b) =>
                    a.changePercentNumeric - b.changePercentNumeric
            ) // most negative first
            .slice(0, 5)
            .map(mapQuoteToMover);

        const actives = validUniverse
            .slice()
            .sort(
                (a, b) =>
                    Math.abs(b.changePercentNumeric) -
                    Math.abs(a.changePercentNumeric)
            ) 
            .slice(0, 5)
            .map(mapQuoteToMover);

        return res.json({
            asOf: new Date().toISOString(),
            indices,
            movers: {
                gainers,
                losers,
                actives,
            },
            // news: [] // we can plug a news API in here later
        });
    } catch (err) {
        console.error(
            "❌ daily-market error:", 
            err.response?.data || err.message
        );
        return res.status(500).json({
            error: "Failed to fetch daily market snapshot. Try again soon.",
            details: err.response?.data || null,
        });
    }
});

// GET /api/flows/stock-deep-dive?symbol=AAPL
router.get("/stock-deep-dive", async (req, res) => {
    const symbol = (req.query.symbol || "AAPL").toUpperCase();

    if (!FINNHUB_API_KEY) {
        return res.status(500).json({ 
            error: "Missing FINNHUB_API_KEY in backend .env",
        });
    }

    try {
        const today = new Date();
        const to = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const fromDate = new Date();
        fromDate.setDate(today.getDate() - 7);
        const from = fromDate.toISOString().slice(0, 10);
    
        // quote + profile + recent news in parallel
        const [quoteRes, profileRes, newsRes] = await Promise.all([
            axios.get("https://finnhub.io/api/v1/quote", {
                params: {
                    symbol,
                    token: FINNHUB_API_KEY,
                },
            }),
            axios.get("https://finnhub.io/api/v1/stock/profile2", {
                params: {
                    symbol,
                    token: FINNHUB_API_KEY,
                },
            }),
            axios.get("https://finnhub.io/api/v1/company-news", {
                params: {
                    symbol,
                    from,
                    to,
                    token: FINNHUB_API_KEY,
                },
            }),
        ]);

        const q = quoteRes.data || {};
        const profile = profileRes.data || {};
        const newsRaw = Array.isArray(newsRes.data) ? newsRes.data : [];

        const payload = {
            symbol,
            quote: {
                price: typeof q.c === "number" ? q.c : null,
                change: typeof q.d === "number" ? q.d : null,
                changePercent:
                    typeof q.dp === "number"
                    ? `${q.dp.toFixed(2)}%` 
                    : null,
                previousClose:
                    typeof q.pc === "number" ? q.pc : null,
                volume: null, // Finnhub /quote does not include volume
            },
            overview: {
                name: profile.Name || symbol,
                sector: profile.finnhubIndustry || null,
                industry: profile.gsector || null,
                marketCap: profile.marketCapitalization
                    ? Number(profile.marketCapitalization)
                    : null,
                peRatio: null,
                dividendYield: 
                    profile.dividendYield != null
                        ? Number(profile.dividendYield)
                        : null,
                // Simple, truthful templated description based on real fields
                description: 
                    profile.name && profile.finnhubIndustry
                    ? `${profile.name} operates in the ${profile.finnhubIndustry} industry.`
                    : null,
            },
            news: newsRaw.slice(0, 5).map((item) => ({
                id:
                    (item.id != null
                        ? item.id.toString()
                        : item.url) || `${symbol}-${item.datetime}`,
                title: item.headline,
                source: item.source,
                url: item.url,
                summary: item.summary,
                publishedAt: item.datetime
                    ? new Date(item.datetime * 1000).toISOString()
                    : null,
            })),
        };

        res.json(payload);
    } catch (err) {
        console.error(
            "❌ stock-deep-dive error:",
            err.response?.data || err.message
        );
        res
            .status(500).json({ 
                error: "Failed to fetch stock deep dive. Try again later.",
        });
    }
});


router.get("/weather-brief", async (req, res) => {
    try {
        // Re-using the existing weather endpoint so theres no duplication
        const weatherRes = await axios.get("http://localhost:5000/api/weather/today");
        const w = weatherRes.data || {};

        const now = new Date();

        const payload = {
            asOf: now.toISOString(),
            city: w.city || "Cleveland",
            tempF: typeof w.tempF === "number" ? w.tempF : null,
            // single summary for now — upgrade available later when the weather endpoint returns more fields
            summary: w.summary || `Current temperature in ${w.city || "your city"}.`,
            // placeholders to fill in later (hourly forecast, sports, etc.)
            nextHours: w.nextHours || [],
            events: [],
        };

        return res.json(payload);
    } catch (err) {
        console.error("❌ weather-brief error:", err.response?.data || err.message);
        return res.status(500).json({
            error: "Failed to fetch weather brief. Try again later.",
        });
    }
});
module.exports = router;