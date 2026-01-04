// obel-frontend/api/stocks/detail/[symbol].js

module.exports = async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "").toString().trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });
    }

    // Twelve Data profile endpoint
    const url =
      "https://api.twelvedata.com/profile" +
      `?symbol=${encodeURIComponent(symbol)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || data?.status === "error") {
      // fallback: return minimal profile so UI still works
      return res.status(200).json({
        profile: {
          symbol,
          name: symbol,
          description: "",
          industry: "",
          country: "",
          marketCap: null,
          website: "",
        },
      });
    }

    const profile = {
      symbol,
      name: data.name || data.short_name || symbol,
      description: data.description || data.summary || "",
      industry: data.industry || "",
      country: data.country || "",
      marketCap: data.market_cap || null,
      website: data.website || "",
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({ profile });
  } catch (err) {
    console.error("detail error:", err);
    return res.status(500).json({ error: "Detail unavailable" });
  }
};
