// obel-frontend/api/stocks/watchlist.js

module.exports = async function handler(req, res) {
  try {
    const symbolsRaw = (req.query.symbols || "").toString().trim();
    if (!symbolsRaw) {
      return res.status(400).json({ error: "Missing symbols query param" });
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });
    }

    const url =
      "https://api.twelvedata.com/quote" +
      `?symbol=${encodeURIComponent(symbolsRaw)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url);
    const data = await r.json();

    // Twelve Data returns either:
    // - a single quote object (when 1 symbol)
    // - or an object keyed by symbol (when multiple)
    const normalizeOne = (q) => {
      if (!q || q.status === "error") return null;

      const price = Number(q.close ?? q.price ?? q.last ?? q.open);
      const change = Number(q.change);
      const changePercent = Number(q.percent_change ?? q.change_percent);

      return {
        symbol: q.symbol,
        name: q.name || q.symbol,
        price: Number.isFinite(price) ? price : null,
        change: Number.isFinite(change) ? change : null,
        changePercent: Number.isFinite(changePercent) ? changePercent : null,
      };
    };

    let quotes = [];

    if (data && typeof data === "object" && data.symbol) {
      const one = normalizeOne(data);
      if (one) quotes = [one];
    } else if (data && typeof data === "object") {
      quotes = Object.values(data)
        .map(normalizeOne)
        .filter(Boolean);
    }

    // Helpful caching (optional)
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");

    return res.status(200).json({
      asOf: new Date().toISOString(),
      quotes,
    });
  } catch (err) {
    console.error("watchlist error:", err);
    return res.status(500).json({ error: "Watchlist unavailable" });
  }
};
