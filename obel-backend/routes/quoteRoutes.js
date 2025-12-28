const express = require("express");

const router = express.Router();

// GET /api/quotes/random
router.get("/random", async (req, res) => {
    try {
        const r = await fetch("https://zenquotes.io/api/random", {
            headers: { "User-Agent": "ObelDashboard/1.0" },
        });

        if (!r.ok) {
            return res.status(r.status).json({ error: "ZenQuotes request failed" });
        }

        const data = await r.json(); // ZenQuotes returns an array
        const first = Array.isArray(data) ? data[0] : null;

        const text = first?.q ?? "";
        const author = first?.a ?? "";

        return res.json({ text, author });
    } catch (err) {
        console.error("❌ ZenQuotes proxy error:", err);
        return res.status(500).json({ error: "Quote service unavailable" });
    }
});

module.exports = router;