const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "2a24558a7f0249c6825980e76ae670fc";

// ✅ Get OHLC candles
router.get("/ohlc", async (req, res) => {
    const { symbol, interval } = req.query;
    console.log("📡 OHLC Request Params:", symbol, interval);

    try {
        const response = await axios.get("https://api.twelvedata.com/time_series", {
            params: {
                symbol,
                interval,
                outputsize: 100,
                apikey: API_KEY
            }
        });

        if (response.data.status === "error") {
            return res.status(400).json({ error: response.data.message });
        }

        const formatted = response.data.values.map(entry => ({
            time: Math.floor(new Date(entry.datetime).getTime() / 1000),
            open: parseFloat(entry.open),
            high: parseFloat(entry.high),
            low: parseFloat(entry.low),
            close: parseFloat(entry.close)
        }));

        res.json(formatted.reverse()); // Ascending time order
    } catch (err) {
        console.error("🔥 OHLC Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch OHLC data" });
    }   
});

// Get current stock price/quote
router.get("/quote", async (req, res) => {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: "Missing symbol" });

    try {
        const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`;
        const response = await axios.get(url);
        const d = response.data;

        res.status(200).json({
            price: parseFloat(d.price),
            change: parseFloat(d.change),
            changePercent: parseFloat(d.percent_change),
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            updated: d.datetime
        });
    } catch (err) {
        console.error("🔥 Quote fetch error:", err.message);
        res.status(500).json({ error: "Failed to fetch stock quote" });
    }
});

module.exports = router;