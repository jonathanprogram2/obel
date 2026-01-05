module.exports = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "").trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

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

    const [qRaw, pRaw] = await Promise.all([
      fetchJson(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
      fetchJson(`https://api.twelvedata.com/profile?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
    ]);

    // Normalize quote into what the React UI expects
    const quote = {
      symbol,
      price: toNum(qRaw.close ?? qRaw.price),
      change: toNum(qRaw.change),
      changePercent: toNum(qRaw.percent_change ?? qRaw.changePercent),
      high: toNum(qRaw.high),
      low: toNum(qRaw.low),
      open: toNum(qRaw.open),
      previousClose: toNum(qRaw.previous_close ?? qRaw.previousClose),
      timestamp: toNum(qRaw.timestamp) ? Math.floor(toNum(qRaw.timestamp)) : null,
    };

    const website = pRaw.website || pRaw.weburl || "";
    let logo = pRaw.logo || null;

    
    if (!logo && website) {
      try {
        const domain = website.replace(/^https?:\/\//, "").split("/")[0];
        if (domain) logo = `https://logo.clearbit.com/${domain}`;
      } catch {}
    }

    const profile = {
      symbol,
      name: pRaw.name || symbol,
      exchange: pRaw.exchange || null,
      currency: pRaw.currency || "USD",
      industry: pRaw.industry || null,
      country: pRaw.country || null,
      marketCap: toNum(pRaw.market_cap ?? pRaw.marketCap) ?? null,
      weburl: website || null,
      logo,
      description: pRaw.description || null,
    };

    
    const w52Low = toNum(qRaw?.fifty_two_week?.low);
    const w52High = toNum(qRaw?.fifty_two_week?.high);
    const week52Return =
      quote.price != null && w52Low != null && w52Low > 0
        ? ((quote.price - w52Low) / w52Low) * 100
        : null;

    const metrics = {
      peTTM: null,
      epsTTM: null,
      roeTTM: null,
      week52Low: w52Low,
      week52High: w52High,
      week52Return,
    };

    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=120");
    return res.status(200).json({
      asOf: new Date().toISOString(),
      quote,
      profile,
      metrics,
      news: [], 
    });
  } catch (err) {
    console.error("detail route error:", err);
    return res.status(500).json({ error: "Failed to fetch stock detail" });
  }
};
