module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const symbolsRaw = String(req.query.symbols || "").trim();
    if (!symbolsRaw) return res.status(400).json({ error: "Missing symbols query param" });

    const symbols = symbolsRaw
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 25);

    const fetchJson = async (url) => {
      const r = await fetch(url);
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!r.ok) throw new Error(data?.message || data?.error || text || `HTTP ${r.status}`);
      return data;
    };

    const results = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const q = await fetchJson(
            `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`
          );
          return { symbol: sym, quote: q };
        } catch (e) {
          return { symbol: sym, error: e.message };
        }
      })
    );

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({ asOf: new Date().toISOString(), results });
  } catch (err) {
    console.error("watchlist route error:", err);
    return res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};
