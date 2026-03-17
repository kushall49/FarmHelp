const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, error: 'lat and lon required' });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      return res.json({ success: true, weather: { temp: 28, feelsLike: 32, condition: 'Partly Cloudy', humidity: 65, windSpeed: 12, icon: '⛅' } });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const d = response.data;
    res.json({
      success: true,
      weather: {
        temp: Math.round(d.main.temp),
        feelsLike: Math.round(d.main.feels_like),
        condition: d.weather[0].description,
        humidity: d.main.humidity,
        windSpeed: Math.round(d.wind.speed * 3.6),
        icon: d.weather[0].icon
      }
    });
  } catch (err) {
    res.json({ success: true, weather: { temp: 28, feelsLike: 32, condition: 'Partly Cloudy', humidity: 65, windSpeed: 12, icon: '⛅' } });
  }
});

module.exports = router;
