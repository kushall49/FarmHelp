const axios = require('axios');

/**
 * Weather Service - Integrates with OpenWeatherMap API
 */
class WeatherService {
  constructor() {
    // Always use environment variable for API key (no hardcoded fallback for security)
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Get weather information for a location
   * @param {string} location - City name or coordinates
   * @returns {string} Weather information
   */
  async getWeather(location = 'Delhi') {
    try {
      console.log(`[WEATHER-SERVICE] Fetching weather for: ${location}`);

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const weather = response.data;
      
      return this._formatWeatherResponse(weather);
    } catch (error) {
      console.error('[WEATHER-SERVICE] Error:', error.message);
      
      if (error.response?.status === 404) {
        return `❌ Location "${location}" not found. Please check the city name and try again.`;
      }
      
      return `⚠️ Unable to fetch weather data. Please try again later or check if the location name is correct.`;
    }
  }

  /**
   * Get weather forecast (5 days)
   */
  async getForecast(location = 'Delhi') {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          cnt: 8 // Next 24 hours (8 x 3-hour periods)
        },
        timeout: 5000
      });

      return this._formatForecastResponse(response.data);
    } catch (error) {
      console.error('[WEATHER-SERVICE] Forecast error:', error.message);
      return 'Unable to fetch weather forecast.';
    }
  }

  /**
   * Format weather response
   */
  _formatWeatherResponse(weather) {
    const emoji = this._getWeatherEmoji(weather.weather[0].main);
    
    return `${emoji} **Weather in ${weather.name}, ${weather.sys.country}:**

🌡️ Temperature: ${weather.main.temp}°C (Feels like: ${weather.main.feels_like}°C)
📊 Conditions: ${weather.weather[0].description}
💧 Humidity: ${weather.main.humidity}%
💨 Wind Speed: ${weather.wind.speed} m/s
☁️ Cloud Cover: ${weather.clouds.all}%
${weather.rain ? `🌧️ Rainfall: ${weather.rain['1h'] || weather.rain['3h'] || 0}mm` : ''}

**Farming Advice:**
${this._getFarmingAdvice(weather)}`;
  }

  /**
   * Format forecast response
   */
  _formatForecastResponse(forecast) {
    const cityName = forecast.city.name;
    const forecasts = forecast.list.slice(0, 3); // Next 9 hours
    
    let response = `🌤️ **Weather Forecast for ${cityName}:**\n\n`;
    
    forecasts.forEach((f, index) => {
      const time = new Date(f.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      response += `⏰ ${time}: ${f.main.temp}°C, ${f.weather[0].description}\n`;
    });
    
    return response;
  }

  /**
   * Get weather emoji
   */
  _getWeatherEmoji(condition) {
    const emojis = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Haze': '🌫️',
      'Fog': '🌫️'
    };
    
    return emojis[condition] || '🌤️';
  }

  /**
   * Provide farming advice based on weather
   */
  _getFarmingAdvice(weather) {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const hasRain = weather.rain ? true : false;

    let advice = [];

    if (hasRain) {
      advice.push('✅ Good time for transplanting rice');
      advice.push('⚠️ Delay pesticide spray due to rain');
    }

    if (temp > 35) {
      advice.push('🌡️ High temperature - ensure adequate irrigation');
      advice.push('⚠️ Watch for heat stress in crops');
    } else if (temp < 10) {
      advice.push('❄️ Protect crops from frost');
      advice.push('✅ Good for Rabi crops like wheat');
    }

    if (humidity > 80) {
      advice.push('💧 High humidity - watch for fungal diseases');
    }

    return advice.length > 0 ? advice.join('\n') : '✅ Weather conditions are favorable for farming';
  }
}

module.exports = new WeatherService();
