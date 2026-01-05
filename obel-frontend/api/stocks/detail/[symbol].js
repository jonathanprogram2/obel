module.exports = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "").trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const fetchJson = async (url) => {
      const r = await fetch(url);
      const text = await r.text();
      let data = null;
      try { data = JSON.parse(text); } catch { /* ignore */ }

      // Twelve Data sometimes returns 200 with {status:"error"}
      if (!r.ok) throw new Error(data?.message || data?.error || text || `HTTP ${r.status}`);
      if (data?.status === "error") throw new Error(data?.message || "Twelve Data error");
      return data;
    };

    // --- Twelve Data: quote + profile ---
    const quoteRaw = await fetchJson(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`
    );

    let profileRaw = null;
    try {
      profileRaw = await fetchJson(
        `https://api.twelvedata.com/profile?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`
      );
    } catch (e) {
      profileRaw = null;
    }

    // --- Normalize quote fields for your UI ---
    const price = Number(quoteRaw.close ?? quoteRaw.price ?? quoteRaw.last ?? null);
    const open = Number(quoteRaw.open ?? null);
    const high = Number(quoteRaw.high ?? null);
    const low = Number(quoteRaw.low ?? null);
    const previousClose = Number(quoteRaw.previous_close ?? quoteRaw.previousClose ?? null);
    const change = Number(quoteRaw.change ?? null);
    const changePercent = Number(quoteRaw.percent_change ?? quoteRaw.change_percent ?? null);
    const timestamp = Number(quoteRaw.timestamp ?? null);

    const fiftyTwo = quoteRaw.fifty_two_week || {};
    const week52Low = Number(fiftyTwo.low ?? null);
    const week52High = Number(fiftyTwo.high ?? null);
    const week52Return = Number(fiftyTwo.low_change_percent ?? null); 

    // --- Normalize profile fields ---
    const profile = profileRaw
      ? {
          symbol,
          name: profileRaw.name || quoteRaw.name || symbol,
          exchange: profileRaw.exchange || quoteRaw.exchange || "",
          currency: profileRaw.currency || quoteRaw.currency || "USD",
          sector: profileRaw.sector || "",
          industry: profileRaw.industry || "",
          country: profileRaw.country || "",
          description: profileRaw.description || "",
          employees: profileRaw.employees ? Number(profileRaw.employees) : null,
          website: profileRaw.website || "",
          weburl: profileRaw.website || "",
          marketCap: profileRaw.market_cap ? Number(profileRaw.market_cap) : null,
          logo: null,
        }
      : {
          symbol,
          name: quoteRaw.name || symbol,
          exchange: quoteRaw.exchange || "",
          currency: quoteRaw.currency || "USD",
          sector: "",
          industry: "",
          country: "",
          description: "",
          employees: null,
          website: "",
          weburl: "",
          marketCap: null,
          logo: null,
        };

    // Better logo fallback than Clearbit (less likely to be blocked)
    if (profile.weburl) {
      try {
        const host = new URL(profile.weburl).hostname;
        profile.logo = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
      } catch {}
    }

    // --- News (Yahoo Finance RSS, free) ---
    const news = [];
    try {
      const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;
      const rssRes = await fetch(rssUrl);
      const rssText = await rssRes.text();

      const items = rssText.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (let i = 0; i < Math.min(items.length, 8); i++) {
        const item = items[i];

        const title =
          (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
            item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
            "").trim();

        const link = (item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
        const pubDate = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
        const dt = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : null;

        if (title && link) {
          news.push({
            id: `${symbol}_${i}_${dt || Date.now()}`,
            headline: title,
            url: link,
            source: "Yahoo Finance",
            datetime: dt,
          });
        }
      }
    } catch {
      // If RSS fails, just return empty news
    }

    // Cache to reduce rate limit pain
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");

    return res.status(200).json({
      asOf: new Date().toISOString(),
      quote: { symbol, price, open, high, low, previousClose, change, changePercent, timestamp },
      profile,
      metrics: { week52Low, week52High, week52Return, peTTM: null, epsTTM: null, roeTTM: null },
      news,
    });
  } catch (err) {
    console.error("detail route error:", err);
    return res.status(500).json({ error: "Failed to fetch stock detail" });
  }
};
