// Vercel Serverless Function: GET /api/weather/today
// No API key required (Open-Meteo)

module.exports = async (req, res) => {
  try {
    const CLEVELAND_LAT = 41.4993;
    const CLEVELAND_LON = -81.6944;

    const WEATHER_CODE_MAP = {
      0: { condition: "Clear sky", iconCode: "01d" },
      1: { condition: "Mainly clear", iconCode: "02d" },
      2: { condition: "Partly cloudy", iconCode: "03d" },
      3: { condition: "Overcast", iconCode: "04d" },
      45: { condition: "Fog", iconCode: "50d" },
      48: { condition: "Freezing fog", iconCode: "50d" },
      51: { condition: "Light drizzle", iconCode: "09d" },
      53: { condition: "Moderate drizzle", iconCode: "09d" },
      55: { condition: "Dense drizzle", iconCode: "09d" },
      61: { condition: "Slight rain", iconCode: "10d" },
      63: { condition: "Moderate rain", iconCode: "10d" },
      65: { condition: "Heavy rain", iconCode: "10d" },
      71: { condition: "Slight snow", iconCode: "13d" },
      73: { condition: "Moderate snow", iconCode: "13d" },
      75: { condition: "Heavy snow", iconCode: "13d" },
      80: { condition: "Rain showers", iconCode: "09d" },
      95: { condition: "Thunderstorm", iconCode: "11d" },
    };

    const mapWeatherCode = (code) =>
      WEATHER_CODE_MAP[code] || { condition: "Unknown", iconCode: "01d" };

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(CLEVELAND_LAT));
    url.searchParams.set("longitude", String(CLEVELAND_LON));
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "apparent_temperature",
        "relativehumidity_2m",
        "pressure_msl",
        "windspeed_10m",
        "weather_code",
      ].join(",")
    );
    url.searchParams.set("daily", ["sunrise", "sunset"].join(","));
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("timezone", "auto");

    const r = await fetch(url.toString());
    const data = await r.json();

    if (!r.ok) {
      return res.status(500).json({ error: "Weather provider failed", details: data });
    }

    const c = data.current || {};
    const { condition, iconCode } = mapWeatherCode(c.weather_code);

    return res.json({
      city: "Cleveland",
      tempF: c.temperature_2m ?? null,
      feelsLikeF: c.apparent_temperature ?? null,
      humidity: c.relativehumidity_2m ?? null,
      pressureMb: c.pressure_msl ?? null,
      windSpeed: c.windspeed_10m ?? null,
      summary: condition,
      condition,
      iconCode,
    });
  } catch (e) {
    console.error("weather/today error:", e);
    return res.status(500).json({ error: "Failed to fetch weather" });
  }
};
