package com.stylofit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class WeatherService {
    
    @Value("${weather.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather";
    
    public Map<String, Object> getWeatherData(String location) {
        String url = String.format("%s?q=%s&appid=%s&units=metric", WEATHER_API_URL, location, apiKey);
        
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Map<String, Object> weather = ((java.util.List<Map<String, Object>>) response.get("weather")).get(0);
            
            return Map.of(
                "temperature", main.get("temp"),
                "humidity", main.get("humidity"),
                "description", weather.get("description"),
                "main", weather.get("main")
            );
        } catch (Exception e) {
            // Return default weather data if API fails
            return Map.of(
                "temperature", 22.0,
                "humidity", 60,
                "description", "clear sky",
                "main", "Clear"
            );
        }
    }
    
    public String getWeatherRecommendation(Map<String, Object> weatherData) {
        Double temperature = (Double) weatherData.get("temperature");
        String description = (String) weatherData.get("description");
        
        if (temperature > 30) {
            return "Hot weather: Choose light colors, breathable fabrics like cotton, and minimal layers.";
        } else if (temperature < 15) {
            return "Cold weather: Opt for warm layers, darker colors, and materials like wool or fleece.";
        } else if (description.contains("rain")) {
            return "Rainy weather: Select waterproof materials, darker colors, and appropriate footwear.";
        } else {
            return "Pleasant weather: Perfect for any style choice. Mix and match as you prefer!";
        }
    }
}