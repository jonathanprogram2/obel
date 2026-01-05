// obel-frontend/api/stocks/detail/[symbol].js

module.exports = async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "").toString().trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });
    }

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const isTDerror = (d) => d && typeof d === "object" && d.status === "error";

    const quoteUrl =
      "https://api.twelvedata.com/quote" +
      `?symbol=${encodeURIComponent(symbol)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const profileUrl =
      "https://api.twelvedata.com/profile" +
      `?symbol=${encodeURIComponent(symbol)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const [qRes, pRes] = await Promise.all([fetch(quoteUrl), fetch(profileUrl)]);
    const [qData, pData] = await Promise.all([qRes.json(), pRes.json()]);

    const quote =
      !qRes.ok || isTDerror(qData)
        ? null
        : {
            symbol: qData.symbol || symbol,
            price: toNum(qData.close ?? qData.price ?? qData.last ?? qData.open),
            open: toNum(qData.open),
            high: toNum(qData.high),
            low: toNum(qData.low),
            previousClose: toNum(qData.previous_close),
            volume: toNum(qData.volume),
            change: toNum(qData.change),
            changePercent: toNum(qData.percent_change ?? qData.change_percent),
            currency: qData.currency || null,
            exchange: qData.exchange || null,
            datetime: qData.datetime || null,
          };

    const profile =
      !pRes.ok || isTDerror(pData)
        ? {
            symbol,
            name: symbol,
            description: "",
            industry: "",
            country: "",
            marketCap: null,
            website: "",
            exchange: quote?.exchange || "",
            currency: quote?.currency || "USD",
            logo: "",
          }
        : {
            symbol,
            name: pData.name || pData.short_name || symbol,
            description: pData.description || pData.summary || "",
            industry: pData.industry || "",
            country: pData.country || "",
            marketCap: toNum(pData.market_cap),
            website: pData.website || "",
            exchange: pData.exchange || quote?.exchange || "",
            currency: pData.currency || quote?.currency || "USD",
            logo: pData.logo || "",
          };

    // Optional: keep a slot for later fundamentals/news
    const metrics = {
      marketCap: profile.marketCap ?? null,
    };

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");

    return res.status(200).json({
      asOf: new Date().toISOString(),
      symbol,
      quote,
      profile,
      metrics,
      news: [], // later we can plug in a real news feed
    });
  } catch (err) {
    console.error("detail error:", err);
    return res.status(500).json({ error: "Detail unavailable" });
  }
};
