const express = require("express");

const router = express.Router();

const CATEGORY_MAP = {
    all: null,             // default "everything"
    politics: "politics",
    sports: "sports",
    entertainment: "entertainment",
    "sci-tech": "science,technology",
};

// simple in-memory cache so we don't burn the free quota
const cache = new Map(); // key -> { timestamp, data }
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

router.get("/", async (req, res) => {
    const uiCategory = (req.query.category || "all").toLowerCase();
    const newsdataCategory = CATEGORY_MAP[uiCategory] ?? null;

    const cacheKey = newsdataCategory || "all";
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
    }

    if (!process.env.NEWSDATA_API_KEY) {
        return res.status(500).json({ error: "Missing NEWSDATA_API_KEY in backend .env"});
    }

    try {
        const params = new URLSearchParams({
            apikey: process.env.NEWSDATA_API_KEY,
            language: "en",
            country: "us",
        });

        if (newsdataCategory) {
            params.set("category", newsdataCategory);
        }

        const url = `https://newsdata.io/api/1/news?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NewsData.io HTTP ${response.status}`);
        }

        const raw = await response.json();

        const articles = (raw.results || []).map((item, index) => ({
            id: item.article_id || item.link || `${cacheKey}-${index}`,
            title: item.title,
            description: item.description || item.content || "",
            url: item.link,
            imageUrl: item.image_url || null,
            publishedAt: item.pubDate || null,
            sourceName: item.source_id || (item.creator && item.creator[0]) || "Unknown source",
            categories: item.category || [],
            country: item.country || [],
            language: item.language || "en",
        }));

        const payload = {
            category: uiCategory,
            totalResults: raw.totalResults || raw.totalResultsCount || articles.length,
            articles,
        };

        cache.set(cacheKey, { timestamp: now, data: payload });

        res.json(payload);
    } catch (err) {
        console.error("❌ /api/news error:", err);
        res.status(500).json({ error: "Failed to load news" });
    }
});

module.exports = router;