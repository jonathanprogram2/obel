// obel-frontend/api/weather/today.js

module.exports = async (req, res) => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY" });
    }

    const city = (req.query.city || "Cleveland").toString();
    const url =
      "https://api.openweathermap.org/data/2.5/weather" +
      `?q=${encodeURIComponent(city)}` +
      `&appid=${encodeURIComponent(API_KEY)}` +
      `&units=imperial`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.message || "Weather request failed",
      });
    }

    const tz = Number(data.timezone || 0); // seconds offset from UTC
    const fmtTime = (unixSec) => {
      if (!unixSec) return null;
      const d = new Date((unixSec + tz) * 1000);
      const hh = d.getUTCHours();
      const mm = d.getUTCMinutes();
      const hour12 = ((hh + 11) % 12) + 1;
      const ampm = hh >= 12 ? "PM" : "AM";
      return `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;
    };

    const w0 = data.weather?.[0] || {};
    return res.status(200).json({
      city: data.name || city,
      tempF: data.main?.temp ?? null,
      feelsLikeF: data.main?.feels_like ?? null,
      humidity: data.main?.humidity ?? null,
      pressureMb: data.main?.pressure ?? null,
      windSpeed: data.wind?.speed ?? null,
      sunrise: fmtTime(data.sys?.sunrise),
      sunset: fmtTime(data.sys?.sunset),
      summary: w0.description ? capitalize(w0.description) : "",
      condition: w0.main || w0.description || null,
      iconCode: w0.icon || null,
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return res.status(500).json({ error: "Weather unavailable" });
  }
};

function capitalize(s = "") {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
