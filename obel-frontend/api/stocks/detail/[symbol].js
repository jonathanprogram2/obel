export default async function handler(req, res) {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing TWELVE_DATA_API_KEY" });
    }

    const raw = req.query.symbol;
    const symbol = Array.isArray(raw) ? raw[0] : raw;
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    const sym = symbol.toUpperCase();
    const base = "https://api.twelvedata.com";

    const safeJson = async (r) => {
      const txt = await r.text();
      try { return JSON.parse(txt); } catch { return { __raw: txt }; }
    };

    const domainFromUrl = (url) => {
      try {
        const h = new URL(url).hostname;
        return h.replace(/^www\./, "");
      } catch {
        return "";
      }
    };

    const parseYahooRss = (xml) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let m;
      while ((m = itemRegex.exec(xml))) {
        const chunk = m[1];

        const get = (tag) => {
          const r = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i").exec(chunk);
          return r?.[1]?.trim() || "";
        };

        const title = get("title").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        const link = get("link").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
        const pubDate = get("pubDate").trim();

        if (title && link) {
          items.push({
            title,
            url: link,
            source: "Yahoo Finance",
            publishedAt: pubDate,
          });
        }
      }
      return items.slice(0, 6);
    };

    // Fetch quote + profile + statistics (best effort)
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

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const quote = {
      symbol: quoteRaw?.symbol || sym,
      name: quoteRaw?.name || profileRaw?.name || sym,
      exchange: quoteRaw?.exchange || profileRaw?.exchange || "",
      currency: quoteRaw?.currency || profileRaw?.currency || "USD",
      lastPrice: num(quoteRaw?.close ?? quoteRaw?.price),
      change: num(quoteRaw?.change),
      percentChange: num(quoteRaw?.percent_change),
      high: num(quoteRaw?.high),
      low: num(quoteRaw?.low),
      open: num(quoteRaw?.open),
      prevClose: num(quoteRaw?.previous_close),
      updatedAt: new Date().toISOString(),
    };

    const profile = {
      symbol: sym,
      name: profileRaw?.name || quote.name,
      exchange: quote.exchange,
      currency: quote.currency,
      industry: profileRaw?.industry || profileRaw?.sector || "",
      country: profileRaw?.country || "",
      website,
      logo, // <-- fixes your “AAP / MSF” fallback in prod
    };

    const metrics = {
      marketCap: num(statsRaw?.market_cap),
      peTtm: num(statsRaw?.pe_ttm ?? statsRaw?.pe),
      epsTtm: num(statsRaw?.eps_ttm ?? statsRaw?.eps),
      roeTtm: num(statsRaw?.roe),
      week52Low: num(statsRaw?.fifty_two_week?.low),
      week52High: num(statsRaw?.fifty_two_week?.high),
      week52Return: num(statsRaw?.fifty_two_week?.return),
    };

    // Headlines (free, no API key)
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

    return res.status(200).json({ quote, profile, metrics, news });
  } catch (e) {
    console.error("detail/[symbol] error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
