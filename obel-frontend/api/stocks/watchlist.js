module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const symbolsRaw = String(req.query.symbols || "").trim();
    if (!symbolsRaw) return res.status(400).json({ error: "Missing symbols query param" });

    // Twelve Data supports comma-separated symbols in one call
    const url =
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbolsRaw)}&apikey=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url);
    const data = await r.json();

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const normalizeOne = (q) => {
      if (!q || q.status === "error") return null;

      return {
        symbol: q.symbol,
        name: q.name || q.symbol,
        price: num(q.close ?? q.price ?? q.last ?? q.open),
        change: num(q.change),
        changePercent: num(q.percent_change ?? q.change_percent),
      };
    };

    let quotes = [];

    // If only 1 symbol, Twelve Data returns a single object with `symbol`
    if (data && typeof data === "object" && data.symbol) {
      const one = normalizeOne(data);
      if (one) quotes = [one];
    } else if (data && typeof data === "object") {
      // Otherwise it returns an object keyed by symbol
      quotes = Object.values(data).map(normalizeOne).filter(Boolean);
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json({ asOf: new Date().toISOString(), quotes });
  } catch (err) {
    console.error("watchlist route error:", err);
    return res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};
