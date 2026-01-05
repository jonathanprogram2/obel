module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });

    const sym = (req.query.symbol || "").toUpperCase();
    if (!sym) return res.status(400).json({ error: "Missing symbol" });

    const base = "https://api.twelvedata.com";

    const safeJson = async (r) => {
      try { return await r.json(); } catch { return null; }
    };

    const domainFromUrl = (url) => {
      try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
    };

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const parseYahooRss = (xml) => {
      const items = [];
      const blocks = xml.split("<item>").slice(1);
      const get = (tag, s) => {
        const m = s.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
        return m ? m[1] : "";
      };

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const title = get("title", b).replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        const link = get("link", b).trim();
        const pubDate = get("pubDate", b).trim();

        if (title && link) {
          const dt = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : null;
          items.push({
            id: `${sym}-${i}`,
            headline: title,
            url: link,
            source: "Yahoo Finance",
            datetime: dt,
          });
        }
      }
      return items.slice(0, 6);
    };

    // Fetch quote + profile + statistics
    const [quoteRes, profileRes, statsRes] = await Promise.all([
      fetch(`${base}/quote?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`),
      fetch(`${base}/profile?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`),
      fetch(`${base}/statistics?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`),
    ]);

    const quoteRaw = await safeJson(quoteRes);
    const profileRaw = await safeJson(profileRes);
    const statsRaw = await safeJson(statsRes);

    if (quoteRaw?.status === "error") {
      return res.status(500).json({ error: quoteRaw?.message || "Quote failed" });
    }

    const website = profileRaw?.website || "";
    const domain = domainFromUrl(website);
    const logo = domain ? `https://logo.clearbit.com/${domain}` : "";

    // ✅ Match what StockDetailPage expects: quote.price, quote.changePercent, quote.previousClose, quote.timestamp
    const price = num(quoteRaw?.close ?? quoteRaw?.price);
    const change = num(quoteRaw?.change);
    const changePercent = num(quoteRaw?.percent_change);
    const high = num(quoteRaw?.high);
    const low = num(quoteRaw?.low);
    const open = num(quoteRaw?.open);
    const previousClose = num(quoteRaw?.previous_close);

    const quote = {
      symbol: quoteRaw?.symbol || sym,
      price,
      change,
      changePercent,
      high,
      low,
      open,
      previousClose,
      timestamp: Math.floor(Date.now() / 1000),
    };

    
    const marketCap = num(statsRaw?.market_cap);

    const profile = {
      symbol: sym,
      name: profileRaw?.name || sym,
      exchange: quoteRaw?.exchange || profileRaw?.exchange || "",
      currency: quoteRaw?.currency || profileRaw?.currency || "USD",
      industry: profileRaw?.industry || profileRaw?.sector || "",
      country: profileRaw?.country || "",
      marketCap,
      website,
      weburl: website,
      logo,
    };

    // ✅ Match what StockDetailPage expects: peTTM/epsTTM/roeTTM/week52Low/week52High/week52Return
    const metrics = {
      peTTM: num(statsRaw?.pe_ttm ?? statsRaw?.pe),
      epsTTM: num(statsRaw?.eps_ttm ?? statsRaw?.eps),
      roeTTM: num(statsRaw?.roe),
      week52Low: num(statsRaw?.fifty_two_week?.low),
      week52High: num(statsRaw?.fifty_two_week?.high),
      week52Return: num(statsRaw?.fifty_two_week?.return),
    };

    // Headlines (free)
    let news = [];
    try {
      const rss = await fetch(
        `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(sym)}&region=US&lang=en-US`
      );
      const xml = await rss.text();
      news = parseYahooRss(xml);
    } catch {
      news = [];
    }

    return res.status(200).json({
      asOf: new Date().toISOString(),
      quote,
      profile,
      metrics,
      news,
    });
  } catch (e) {
    console.error("detail/[symbol] error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
