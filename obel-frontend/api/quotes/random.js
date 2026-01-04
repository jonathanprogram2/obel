// obel-frontend/api/quotes/random.js

module.exports = async (req, res) => {
  try {
    // Try Quotable first
    const r = await fetch("https://api.quotable.io/random");
    if (r.ok) {
      const data = await r.json();
      return res.status(200).json({
        text: data.content,
        author: data.author,
      });
    }

    // Fallback list (so the widget NEVER breaks)
    const fallback = [
      { text: "Discipline is doing what you said you’d do, long after the mood left.", author: "Unknown" },
      { text: "Small steps daily become massive results.", author: "Unknown" },
      { text: "Focus on systems. Results will follow.", author: "Unknown" },
      { text: "Make future-you proud.", author: "Unknown" },
    ];

    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    return res.status(200).json(pick);
  } catch (err) {
    console.error("Quote API error:", err);
    return res.status(500).json({ error: "Quote unavailable" });
  }
};
