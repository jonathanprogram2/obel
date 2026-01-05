module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const symbolsRaw = String(req.query.symbols || "").trim();
    if (!symbolsRaw) return res.status(400).json({ error: "Missing symbols query param" });

    const symbols = symbolsRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 25);

    const toNum = (v) => {
      const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    };

    const fetchJson = async (url) => {
      const r = await fetch(url);
      const text = await r.text();
      let data = null;
      try { data = JSON.parse(text); } catch {}
      if (!r.ok) throw new Error(data?.message || data?.error || text || `HTTP ${r.status}`);
      return data;
    };

    // Twelve Data supports multi-symbol quote in one call: quote?symbol=AAPL,MSFT
    const batch = await fetchJson(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`
    );

    // batch can be {AAPL:{...}, MSFT:{...}} OR error object
    const quotes = symbols.map((sym) => {
      const q = batch?.[sym];
      if (!q || q.status === "error") {
        return { symbol: sym, price: null, change: null, changePercent: null, error: q?.message || q?.error || "No data" };
      }

      const price = toNum(q.close ?? q.price);
      const change = toNum(q.change);
      const changePercent = toNum(q.percent_change ?? q.changePercent);

      return { symbol: sym, price, change, changePercent };
    });

    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=120");
    return res.status(200).json({ asOf: new Date().toISOString(), quotes });
  } catch (err) {
    console.error("watchlist route error:", err);
    return res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};
