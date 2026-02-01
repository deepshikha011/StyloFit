package com.stylofit.service;

import com.stylofit.entity.OutfitRecommendation;
import com.stylofit.entity.ClothingItem;
import com.stylofit.entity.User;
import com.stylofit.repository.OutfitRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class OutfitRecommendationService {

    @Autowired
    private OutfitRecommendationRepository recommendationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private WardrobeService wardrobeService;

    @Autowired
    private WeatherService weatherService;

    public OutfitRecommendation generateRecommendation(Long userId, String occasion, String location) {
        User user = userService.findByUserId(userId);

        // Get weather data
        Map<String, Object> weatherData = weatherService.getWeatherData(location != null ? location : "Delhi");
        String weatherRecommendation = weatherService.getWeatherRecommendation(weatherData);

        // Get user's wardrobe
        List<ClothingItem> wardrobe = wardrobeService.getUserWardrobe(userId);

        // Simple recommendation logic (can be enhanced with AI later)
        List<ClothingItem> recommendedItems = selectOutfit(wardrobe, occasion, weatherData);

        OutfitRecommendation recommendation = new OutfitRecommendation();
        recommendation.setUser(user);
        recommendation.setOccasionRequested(occasion);
        recommendation.setWeatherCondition((String) weatherData.get("description"));
        recommendation.setTemperature((Double) weatherData.get("temperature"));
        recommendation.setStyleReason(weatherRecommendation);
        recommendation.setMatchingScore(calculateMatchingScore(recommendedItems, occasion));
        recommendation.setRecommendedItems(recommendedItems);

        return recommendationRepository.save(recommendation);
    }

    public List<OutfitRecommendation> getRecommendationHistory(Long userId) {
        return recommendationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
    }

    public void updateRecommendationRating(Long recommendationId, Double rating) {
        OutfitRecommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        // In a real app, you might store ratings separately
        // For now, we'll just acknowledge the rating
    }

    private List<ClothingItem> selectOutfit(List<ClothingItem> wardrobe, String occasion, Map<String, Object> weatherData) {
        List<ClothingItem> outfit = new ArrayList<>();
        Double temperature = (Double) weatherData.get("temperature");

        // Filter items by occasion and weather suitability
        List<ClothingItem> suitableItems = wardrobe.stream()
                .filter(item -> matchesOccasion(item, occasion) && matchesWeather(item, temperature))
                .toList();

        if (suitableItems.isEmpty()) {
            // Fallback to any items if no suitable ones found
            suitableItems = wardrobe;
        }

        // Simple outfit selection (top, bottom, shoes)
        ClothingItem top = suitableItems.stream()
                .filter(item -> item.getClothingType().name().contains("SHIRT") ||
                              item.getClothingType().name().contains("T_SHIRT") ||
                              item.getClothingType().name().contains("BLOUSE") ||
                              item.getClothingType().name().contains("JACKET"))
                .findAny().orElse(null);

        ClothingItem bottom = suitableItems.stream()
                .filter(item -> item.getClothingType().name().contains("JEANS") ||
                              item.getClothingType().name().contains("TROUSERS") ||
                              item.getClothingType().name().contains("SHORTS") ||
                              item.getClothingType().name().contains("SKIRT"))
                .findAny().orElse(null);

        ClothingItem shoes = suitableItems.stream()
                .filter(item -> item.getClothingType().name().contains("SNEAKERS") ||
                              item.getClothingType().name().contains("FORMAL_SHOES") ||
                              item.getClothingType().name().contains("SANDALS"))
                .findAny().orElse(null);

        if (top != null) outfit.add(top);
        if (bottom != null) outfit.add(bottom);
        if (shoes != null) outfit.add(shoes);

        return outfit;
    }

    private boolean matchesOccasion(ClothingItem item, String occasion) {
        if (occasion == null) return true;

        String itemOccasion = item.getOccasionType().name();
        return itemOccasion.equalsIgnoreCase(occasion) ||
               (occasion.equalsIgnoreCase("CASUAL") && itemOccasion.equalsIgnoreCase("CASUAL"));
    }

    private boolean matchesWeather(ClothingItem item, Double temperature) {
        if (temperature == null) return true;

        String weatherSuitability = item.getWeatherSuitability().name();

        if (temperature > 25) {
            return weatherSuitability.equals("HOT") || weatherSuitability.equals("ALL_WEATHER");
        } else if (temperature < 15) {
            return weatherSuitability.equals("COLD") || weatherSuitability.equals("ALL_WEATHER");
        } else {
            return true; // Moderate weather
        }
    }

    private Double calculateMatchingScore(List<ClothingItem> items, String occasion) {
        if (items.isEmpty()) return 0.0;

        // Simple scoring based on how well items match the occasion
        double score = items.stream()
                .mapToDouble(item -> matchesOccasion(item, occasion) ? 1.0 : 0.5)
                .average()
                .orElse(0.0);

        return Math.round(score * 100.0) / 100.0;
    }
}
