const router = require('express').Router();
const axios = require('axios');

// Simple demo: fixed to Cleveland coords for now
const CLEVELAND_LAT = 41.4993;
const CLEVELAND_LON = -81.6944;

// Map Open-Meteo WMO weather codes -> text -> icon
// iconCode matches the free OpeanWeather icon CDN: https://openweathermap.org/img/wn/{iconCode}@4x.png

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

    56: { condition: "Light freezing drizzle", iconCode: "13d" },
    57: { condition: "Dense freezing drizzle", iconCode: "13d" },

    61: { condition: "Slight rain", iconCode: "10d" },
    63: { condition: "Moderate rain", iconCode: "10d" },
    65: { condition: "Heavy rain", iconCode: "10d" },

    66: { condition: "Light freezing rain", iconCode: "13d" },
    67: { condition: "Heavy freezing rain", iconCode: "13d" },

    71: { condition: "Slight snow fall", iconCode: "13d" },
    73: { condition: "Moderate snow fall", iconCode: "13d" },
    75: { condition: "Heavy snow fall", iconCode: "13d" },
    77: { condition: "Snow grains", iconCode: "13d" },

    80: { condition: "Slight rain showers", iconCode: "09d" },
    81: { condition: "Moderate rain showers", iconCode: "09d" },
    82: { condition: "Violent rain showers", iconCode: "09d" },

    85: { condition: "Slight snow showers", iconCode: "13d" },
    86: { condition: "Heavy snow showers", iconCode: "13d" },

    95: { condition: "Thunderstorm", iconCode: "11d" },
    96: { condition: "Thunderstorm with slight hail", iconCode: "11d" },
    97: { condition: "Thunderstorm with heavy hail", iconCode: "11d" },
};

function mapWeatherCode(code) {
    if (code == null) return { condition: "Unknown", iconCode: "01d" };
    return WEATHER_CODE_MAP[code] || { condition: "Unknown", iconCode: "01d" };
}


router.get('/today', async (req, res) => {
    try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: CLEVELAND_LAT,
                longitude: CLEVELAND_LON,
                current_weather: true,
                temperature_unit: 'fahrenheit',
            },
        });

        const current = response.data.current_weather;
        const { condition, iconCode } = mapWeatherCode(current?.weathercode);

        return res.json({
            city: 'Cleveland',
            tempF: current?.temperature,
            windSpeed: current?.windspeed,
            weatherCode: current?.weathercode,
            condition,
            iconCode,
            raw: current,  // good for debugging- can remove at a later time
        });
    } catch (err) {
        console.error('❌ Weather API error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

module.exports = router;