const CATEGORY_MAP = {
  all: null,
  politics: "politics",
  sports: "sports",
  entertainment: "entertainment",
  "sci-tech": "science,technology",
};

// simple in-memory cache (works per warm lambda instance)
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCache() {
  if (!globalThis.__obelNewsCache) {
    globalThis.__obelNewsCache = new Map(); // key -> { timestamp, data }
  }
  return globalThis.__obelNewsCache;
}

module.exports = async (req, res) => {
  try {
    const uiCategory = String(req.query.category || "all").toLowerCase();
    const newsdataCategory = CATEGORY_MAP[uiCategory] ?? null;

    const cacheKey = newsdataCategory || "all";
    const cache = getCache();
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json(cached.data);
    }

    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing NEWSDATA_API_KEY in Vercel env vars" });
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      language: "en",
      country: "us",
    });

    if (newsdataCategory) params.set("category", newsdataCategory);

    const url = `https://newsdata.io/api/1/news?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NewsData.io HTTP ${response.status}: ${text}`);
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

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("❌ /api/news error:", err);
    return res.status(500).json({ error: "Failed to load news" });
  }
};
