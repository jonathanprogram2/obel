// Uses a provider, then falls back to local quotes if provider is down.

module.exports = async (req, res) => {
  const fallback = [
    { text: "Discipline beats motivation when motivation disappears.", author: "BoBo" },
    { text: "Small steps, daily — that’s the cheat code.", author: "BoBo" },
    { text: "Do the work, then let the work do the talking.", author: "BoBo" },
  ];

  try {
    // ZenQuotes (no key, but sometimes flaky) — fallback handles it
    const r = await fetch("https://zenquotes.io/api/random", { headers: { "User-Agent": "obel-app" } });
    const data = await r.json();

    if (r.ok && Array.isArray(data) && data[0]?.q) {
      return res.json({ text: data[0].q, author: data[0].a || "" });
    }

    throw new Error("Provider format unexpected");
  } catch (e) {
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    return res.status(200).json(pick);
  }
};
