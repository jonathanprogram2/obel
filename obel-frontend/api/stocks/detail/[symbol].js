module.exports = async (req, res) => {
  try {
    const symbol = String(req.query.symbol || "").trim().toUpperCase();
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const fetchText = async (url) => {
      const r = await fetch(url);
      const t = await r.text();
      if (!r.ok) throw new Error(t || `HTTP ${r.status}`);
      return t;
    };

    const fetchJson = async (url) => {
      const t = await fetchText(url);
      try { return JSON.parse(t); } catch { return null; }
    };

    const domainFromUrl = (url) => {
      try {
        const h = new URL(url).hostname;
        return h.replace(/^www\./, "");
      } catch {
        return "";
      }
    };

    // Very lightweight RSS parsing (no extra deps)
    const parseYahooRss = (xml) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let m;

      const stripCdata = (s) => (s || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();

      const getTag = (chunk, tag) => {
        const r = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i").exec(chunk);
        return stripCdata(r?.[1] || "");
      };

      while ((m = itemRegex.exec(xml))) {
        const chunk = m[1];
        const headline = getTag(chunk, "title");
        const url = getTag(chunk, "link");
        const pubDate = getTag(chunk, "pubDate");

        if (headline && url) {
          const dt = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : null;
          items.push({
            id: `${symbol}-${items.length + 1}`,
            headline,
            url,
            source: "Yahoo Finance",
            datetime: dt,
          });
        }
      }

      return items.slice(0, 8);
    };

    // Pull data from Twelve Data
    const base = "https://api.twelvedata.com";

    const [quoteRaw, profileRaw, statsRaw] = await Promise.all([
      fetchJson(`${base}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
      fetchJson(`${base}/profile?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
      fetchJson(`${base}/statistics?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`),
    ]);

    if (!quoteRaw || quoteRaw.status === "error") {
      return res.status(500).json({ error: quoteRaw?.message || "Quote failed" });
    }

    const website = profileRaw?.website || "";
    const domain = domainFromUrl(website);
    const logo = domain ? `https://logo.clearbit.com/${domain}` : "";

    // Shape EXACTLY how StockDetailPage.js reads it
    const quote = {
      symbol,
      price: num(quoteRaw.close ?? quoteRaw.price),
      change: num(quoteRaw.change),
      changePercent: num(quoteRaw.percent_change ?? quoteRaw.change_percent),
      high: num(quoteRaw.high),
      low: num(quoteRaw.low),
      open: num(quoteRaw.open),
      previousClose: num(quoteRaw.previous_close),
      timestamp: num(quoteRaw.timestamp),
    };

    const profile = {
      symbol,
      name: profileRaw?.name || quoteRaw?.name || symbol,
      exchange: quoteRaw?.exchange || profileRaw?.exchange || "",
      currency: quoteRaw?.currency || profileRaw?.currency || "USD",
      industry: profileRaw?.industry || profileRaw?.sector || "",
      country: profileRaw?.country || "",
      weburl: website || "",
      logo,
      marketCap: num(statsRaw?.market_cap) ?? null,
    };

    const metrics = {
      peTTM: num(statsRaw?.pe_ttm ?? statsRaw?.pe),
      epsTTM: num(statsRaw?.eps_ttm ?? statsRaw?.eps),
      roeTTM: num(statsRaw?.roe),
      week52Low: num(statsRaw?.fifty_two_week?.low),
      week52High: num(statsRaw?.fifty_two_week?.high),
      week52Return: num(statsRaw?.fifty_two_week?.return),
    };

    // Headlines (Yahoo RSS)
    let news = [];
    try {
      const rssXml = await fetchText(
        `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`
      );
      news = parseYahooRss(rssXml);
    } catch (e) {
      news = [];
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json({
      asOf: new Date().toISOString(),
      quote,
      profile,
      metrics,
      news,
    });
  } catch (err) {
    console.error("detail route error:", err);
    return res.status(500).json({ error: "Failed to fetch stock detail" });
  }
};
