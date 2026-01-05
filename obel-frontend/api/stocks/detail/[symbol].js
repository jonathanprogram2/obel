module.exports = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "").trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const fetchJson = async (url) => {
      const r = await fetch(url);
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!r.ok) throw new Error(data?.message || data?.error || text || `HTTP ${r.status}`);
      return data;
    };

    
    let quote = null;
    let profile = null;

    try {
      quote = await fetchJson(
        `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
      );
    } catch (e) {
      console.error("quote fetch failed:", e.message);
    }

    try {
      profile = await fetchJson(
        `https://api.twelvedata.com/profile?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
      );
    } catch (e) {
      console.error("profile fetch failed:", e.message);
    }

    // Cache a bit to reduce rate-limit pain
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

    return res.status(200).json({
      asOf: new Date().toISOString(),
      quote,
      profile,
    });
  } catch (err) {
    console.error("detail route error:", err);
    return res.status(500).json({ error: "Failed to fetch stock detail" });
  }
};
