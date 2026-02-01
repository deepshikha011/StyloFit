package com.stylofit.service;

import com.stylofit.entity.ClothingItem;
import com.stylofit.entity.User;
import com.stylofit.repository.ClothingItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@Service
public class WardrobeService {
    
    @Autowired
    private ClothingItemRepository clothingItemRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String AI_SERVICE_URL = "http://localhost:5000";
    
    public ClothingItem uploadAndAnalyzeClothing(MultipartFile file, Long userId, String itemName) {
        User user = userService.findByUserId(userId);
        
        // Upload image to cloud storage
        String imageUrl = cloudinaryService.uploadImage(file);
        
        // Analyze clothing with AI service
        Map<String, Object> analysis = analyzeClothingImage(imageUrl);
        
        ClothingItem item = new ClothingItem();
        item.setUser(user);
        item.setItemName(itemName);
        item.setImageUrl(imageUrl);
        item.setClothingType(ClothingItem.ClothingType.valueOf((String) analysis.get("clothing_type")));
        item.setPrimaryColor((String) analysis.get("primary_color"));
        item.setSecondaryColor((String) analysis.get("secondary_color"));
        item.setMaterial((String) analysis.get("material"));
        item.setWeatherSuitability(determineWeatherSuitability((String) analysis.get("material")));
        item.setOccasionType(determineOccasionType((String) analysis.get("clothing_type")));
        item.setAiConfidenceScore((Double) analysis.get("confidence"));
        
        return clothingItemRepository.save(item);
    }
    
    public ClothingItem saveClothingItem(ClothingItem item) {
        return clothingItemRepository.save(item);
    }
    
    public List<ClothingItem> getUserWardrobe(Long userId) {
        return clothingItemRepository.findByUserUserId(userId);
    }
    
    public List<ClothingItem> getFilteredWardrobe(Long userId, String occasionType, String weatherSuitability) {
        if (occasionType != null && weatherSuitability != null) {
            return clothingItemRepository.findByUserIdOccasionAndWeather(
                userId, 
                ClothingItem.OccasionType.valueOf(occasionType),
                ClothingItem.WeatherSuitability.valueOf(weatherSuitability)
            );
        } else if (occasionType != null) {
            return clothingItemRepository.findByUserUserIdAndOccasionType(userId, ClothingItem.OccasionType.valueOf(occasionType));
        } else if (weatherSuitability != null) {
            return clothingItemRepository.findByUserUserIdAndWeatherSuitability(userId, ClothingItem.WeatherSuitability.valueOf(weatherSuitability));
        }
        return getUserWardrobe(userId);
    }
    
    public void deleteClothingItem(Long itemId) {
        clothingItemRepository.deleteById(itemId);
    }
    
    private Map<String, Object> analyzeClothingImage(String imageUrl) {
        return restTemplate.postForObject(
            AI_SERVICE_URL + "/analyze-clothing",
            Map.of("image_url", imageUrl),
            Map.class
        );
    }
    
    private ClothingItem.WeatherSuitability determineWeatherSuitability(String material) {
        if (material.toLowerCase().contains("cotton")) return ClothingItem.WeatherSuitability.HOT;
        if (material.toLowerCase().contains("wool")) return ClothingItem.WeatherSuitability.COLD;
        if (material.toLowerCase().contains("polyester")) return ClothingItem.WeatherSuitability.ALL_WEATHER;
        return ClothingItem.WeatherSuitability.ALL_WEATHER;
    }
    
    private ClothingItem.OccasionType determineOccasionType(String clothingType) {
        if (clothingType.contains("FORMAL") || clothingType.contains("BLAZER")) return ClothingItem.OccasionType.BUSINESS;
        if (clothingType.contains("T_SHIRT") || clothingType.contains("JEANS")) return ClothingItem.OccasionType.CASUAL;
        if (clothingType.contains("DRESS")) return ClothingItem.OccasionType.PARTY;
        return ClothingItem.OccasionType.CASUAL;
    }
}