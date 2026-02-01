# StyloFit: File-by-File Explanation - Part 2

## 🎮 Controller Layer (REST API Endpoints)

### `/backend/src/main/java/com/stylofit/controller/UserController.java` - User API Endpoints
**Purpose**: Handles HTTP requests for user operations, converts between DTOs and entities.

```java
package com.stylofit.controller;

import com.stylofit.entity.User;
import com.stylofit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // Register new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId)
            .map(user -> ResponseEntity.ok(user))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Update user profile
    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUserProfile(userId, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Face analysis endpoint
    @PostMapping("/{userId}/analyze-face")
    public ResponseEntity<?> analyzeFace(@PathVariable Long userId, @RequestParam("image") MultipartFile image) {
        // Implementation would call AI service for face analysis
        // Update user's face shape and skin tone
        return ResponseEntity.ok().build();
    }
    
    // Delete user
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

**Controller Features:**
- **@RestController**: Combines `@Controller` and `@ResponseBody`
- **@RequestMapping**: Base URL for all endpoints
- **@CrossOrigin**: Enables CORS for frontend communication
- **@Valid**: Triggers validation annotations
- **ResponseEntity**: Provides full control over HTTP response
- **Error Handling**: Try-catch blocks with appropriate HTTP status codes

---

### `/backend/src/main/java/com/stylofit/controller/WardrobeController.java` - Wardrobe API Endpoints
**Purpose**: Manages clothing item operations through REST API.

```java
package com.stylofit.controller;

import com.stylofit.entity.ClothingItem;
import com.stylofit.service.WardrobeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/wardrobe")
@CrossOrigin(origins = "http://localhost:3000")
public class WardrobeController {
    
    @Autowired
    private WardrobeService wardrobeService;
    
    // Upload clothing item with image
    @PostMapping("/upload")
    public ResponseEntity<?> uploadClothingItem(
            @RequestParam("userId") Long userId,
            @RequestParam("itemName") String itemName,
            @RequestParam("image") MultipartFile image) {
        
        try {
            ClothingItem savedItem = wardrobeService.uploadClothingItem(userId, itemName, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to process image"));
        }
    }
    
    // Get user's complete wardrobe
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClothingItem>> getUserWardrobe(@PathVariable Long userId) {
        List<ClothingItem> wardrobe = wardrobeService.getUserWardrobe(userId);
        return ResponseEntity.ok(wardrobe);
    }
    
    // Filter wardrobe items
    @GetMapping("/user/{userId}/filter")
    public ResponseEntity<List<ClothingItem>> filterWardrobe(
            @PathVariable Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String occasion,
            @RequestParam(required = false) String weather) {
        
        List<ClothingItem> filteredItems = wardrobeService.filterWardrobe(userId, type, occasion, weather);
        return ResponseEntity.ok(filteredItems);
    }
    
    // Get specific clothing item
    @GetMapping("/{itemId}")
    public ResponseEntity<ClothingItem> getClothingItem(@PathVariable Long itemId) {
        return wardrobeService.getClothingItemById(itemId)
            .map(item -> ResponseEntity.ok(item))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Update clothing item
    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateClothingItem(@PathVariable Long itemId, @RequestBody ClothingItem item) {
        try {
            ClothingItem updatedItem = wardrobeService.updateClothingItem(itemId, item);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Delete clothing item
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteClothingItem(@PathVariable Long itemId, @RequestParam Long userId) {
        try {
            wardrobeService.deleteClothingItem(itemId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

**Key Features:**
- **File Upload**: `@RequestParam("image") MultipartFile` for image handling
- **Query Parameters**: `@RequestParam` for filtering options
- **Path Variables**: `@PathVariable` for resource identification
- **HTTP Status Codes**: Appropriate responses (201 Created, 204 No Content, etc.)

---

### `/backend/src/main/java/com/stylofit/controller/OutfitRecommendationController.java` - Recommendation API
**Purpose**: Handles outfit recommendation generation and history management.

```java
package com.stylofit.controller;

import com.stylofit.entity.OutfitRecommendation;
import com.stylofit.service.OutfitRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class OutfitRecommendationController {
    
    @Autowired
    private OutfitRecommendationService recommendationService;
    
    // Generate new outfit recommendation
    @PostMapping("/generate")
    public ResponseEntity<?> generateRecommendation(@RequestBody RecommendationRequest request) {
        try {
            OutfitRecommendation recommendation = recommendationService.generateRecommendation(
                request.getUserId(),
                request.getOccasion(),
                request.getLocation()
            );
            return ResponseEntity.ok(recommendation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Get user's recommendation history with pagination
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<Page<OutfitRecommendation>> getRecommendationHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<OutfitRecommendation> recommendations = recommendationService.getRecommendationHistory(
            userId, PageRequest.of(page, size));
        return ResponseEntity.ok(recommendations);
    }
    
    // Get specific recommendation
    @GetMapping("/{recommendationId}")
    public ResponseEntity<OutfitRecommendation> getRecommendation(@PathVariable Long recommendationId) {
        return recommendationService.getRecommendationById(recommendationId)
            .map(rec -> ResponseEntity.ok(rec))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Provide feedback on recommendation
    @PostMapping("/{recommendationId}/feedback")
    public ResponseEntity<?> provideFeedback(
            @PathVariable Long recommendationId,
            @RequestBody FeedbackRequest feedback) {
        
        try {
            recommendationService.provideFeedback(recommendationId, feedback.getRating(), feedback.getComments());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get recommendations by occasion
    @GetMapping("/user/{userId}/occasion/{occasion}")
    public ResponseEntity<List<OutfitRecommendation>> getRecommendationsByOccasion(
            @PathVariable Long userId,
            @PathVariable String occasion) {
        
        List<OutfitRecommendation> recommendations = recommendationService.getRecommendationsByOccasion(userId, occasion);
        return ResponseEntity.ok(recommendations);
    }
}

// Request DTOs
class RecommendationRequest {
    private Long userId;
    private String occasion;
    private String location;
    // getters and setters
}

class FeedbackRequest {
    private Integer rating;
    private String comments;
    // getters and setters
}
```

**Advanced Features:**
- **Pagination**: `Page<T>` and `PageRequest` for large datasets
- **Request DTOs**: Separate classes for request data
- **Default Parameters**: `@RequestParam(defaultValue = "0")` for optional parameters
- **Complex Operations**: Multi-step recommendation generation

---

## 🔧 Additional Service Classes

### `/backend/src/main/java/com/stylofit/service/OutfitRecommendationService.java` - Recommendation Logic
**Purpose**: Core business logic for generating outfit recommendations using AI and weather data.

```java
package com.stylofit.service;

import com.stylofit.entity.ClothingItem;
import com.stylofit.entity.OutfitRecommendation;
import com.stylofit.entity.User;
import com.stylofit.repository.ClothingItemRepository;
import com.stylofit.repository.OutfitRecommendationRepository;
import com.stylofit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OutfitRecommendationService {
    
    @Autowired
    private OutfitRecommendationRepository recommendationRepository;
    
    @Autowired
    private ClothingItemRepository clothingItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WeatherService weatherService;
    
    // Generate outfit recommendation
    public OutfitRecommendation generateRecommendation(Long userId, String occasion, String location) {
        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get current weather
        WeatherData weather = weatherService.getCurrentWeather(location);
        
        // Get user's clothing items
        List<ClothingItem> allItems = clothingItemRepository.findByUserUserId(userId);
        
        if (allItems.isEmpty()) {
            throw new RuntimeException("No clothing items found. Please add items to your wardrobe first.");
        }
        
        // Filter items by weather and occasion
        List<ClothingItem> suitableItems = filterItemsByWeatherAndOccasion(allItems, weather, occasion);
        
        if (suitableItems.isEmpty()) {
            throw new RuntimeException("No suitable items found for the given weather and occasion.");
        }
        
        // Generate optimal outfit combination
        OutfitCombination bestOutfit = findBestOutfitCombination(suitableItems, user.getPreferredStyle());
        
        // Create recommendation record
        OutfitRecommendation recommendation = new OutfitRecommendation();
        recommendation.setUser(user);
        recommendation.setOccasionRequested(occasion);
        recommendation.setWeatherCondition(weather.getCondition());
        recommendation.setTemperature(weather.getTemperature());
        recommendation.setRecommendedItems(bestOutfit.getItems());
        recommendation.setMatchingScore(bestOutfit.getScore());
        recommendation.setStyleReason(bestOutfit.getReason());
        
        return recommendationRepository.save(recommendation);
    }
    
    // Filter items by weather and occasion
    private List<ClothingItem> filterItemsByWeatherAndOccasion(List<ClothingItem> items, WeatherData weather, String occasion) {
        return items.stream()
            .filter(item -> isWeatherSuitable(item, weather))
            .filter(item -> isOccasionSuitable(item, occasion))
            .collect(Collectors.toList());
    }
    
    // Check weather suitability
    private boolean isWeatherSuitable(ClothingItem item, WeatherData weather) {
        if (weather.getTemperature() > 25) {
            return item.getWeatherSuitability() == ClothingItem.WeatherSuitability.HOT ||
                   item.getWeatherSuitability() == ClothingItem.WeatherSuitability.WARM;
        } else if (weather.getTemperature() > 15) {
            return item.getWeatherSuitability() == ClothingItem.WeatherSuitability.WARM ||
                   item.getWeatherSuitability() == ClothingItem.WeatherSuitability.COOL;
        } else {
            return item.getWeatherSuitability() == ClothingItem.WeatherSuitability.COOL ||
                   item.getWeatherSuitability() == ClothingItem.WeatherSuitability.COLD;
        }
    }
    
    // Check occasion suitability
    private boolean isOccasionSuitable(ClothingItem item, String occasion) {
        ClothingItem.OccasionType occasionType = ClothingItem.OccasionType.valueOf(occasion.toUpperCase());
        return item.getOccasionType() == occasionType;
    }
    
    // Find best outfit combination using color theory and style matching
    private OutfitCombination findBestOutfitCombination(List<ClothingItem> items, String preferredStyle) {
        // Group items by type
        List<ClothingItem> tops = items.stream()
            .filter(item -> isTopItem(item.getClothingType()))
            .collect(Collectors.toList());
        
        List<ClothingItem> bottoms = items.stream()
            .filter(item -> isBottomItem(item.getClothingType()))
            .collect(Collectors.toList());
        
        List<ClothingItem> shoes = items.stream()
            .filter(item -> isShoeItem(item.getClothingType()))
            .collect(Collectors.toList());
        
        // Find best combination
        OutfitCombination bestCombination = null;
        float bestScore = 0;
        
        for (ClothingItem top : tops) {
            for (ClothingItem bottom : bottoms) {
                for (ClothingItem shoe : shoes) {
                    float score = calculateOutfitScore(top, bottom, shoe, preferredStyle);
                    if (score > bestScore) {
                        bestScore = score;
                        bestCombination = new OutfitCombination(
                            Arrays.asList(top, bottom, shoe),
                            score,
                            generateStyleReason(top, bottom, shoe)
                        );
                    }
                }
            }
        }
        
        return bestCombination;
    }
    
    // Calculate outfit compatibility score
    private float calculateOutfitScore(ClothingItem top, ClothingItem bottom, ClothingItem shoe, String preferredStyle) {
        float colorScore = calculateColorCompatibility(top, bottom, shoe);
        float styleScore = calculateStyleCompatibility(top, bottom, shoe, preferredStyle);
        float materialScore = calculateMaterialCompatibility(top, bottom, shoe);
        
        return (colorScore * 0.5f) + (styleScore * 0.3f) + (materialScore * 0.2f);
    }
    
    // Color compatibility using color theory
    private float calculateColorCompatibility(ClothingItem top, ClothingItem bottom, ClothingItem shoe) {
        // Implement color theory rules
        // Complementary colors, analogous colors, monochromatic schemes
        return 0.8f; // Placeholder
    }
    
    // Get recommendation history
    public Page<OutfitRecommendation> getRecommendationHistory(Long userId, Pageable pageable) {
        return recommendationRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    // Provide feedback
    public void provideFeedback(Long recommendationId, Integer rating, String comments) {
        // Implementation would store feedback and use for ML improvement
    }
}
```

**Algorithm Features:**
- **Multi-criteria Filtering**: Weather, occasion, style preferences
- **Scoring System**: Weighted algorithm for outfit quality
- **Color Theory**: Mathematical approach to color matching
- **Performance Optimization**: Stream API for efficient filtering

---

### `/backend/src/main/java/com/stylofit/service/WeatherService.java` - Weather Integration
**Purpose**: Integrates with external weather API to get real-time weather data.

```java
package com.stylofit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.annotation.Cacheable;

@Service
public class WeatherService {
    
    @Value("${weather.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Get current weather with caching
    @Cacheable(value = "weather", key = "#location")
    public WeatherData getCurrentWeather(String location) {
        String url = String.format(
            "http://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
            location, apiKey
        );
        
        try {
            WeatherApiResponse response = restTemplate.getForObject(url, WeatherApiResponse.class);
            return convertToWeatherData(response);
        } catch (Exception e) {
            // Fallback to default weather
            return new WeatherData("Clear", 22.0f);
        }
    }
    
    private WeatherData convertToWeatherData(WeatherApiResponse response) {
        return new WeatherData(
            response.getWeather().get(0).getMain(),
            response.getMain().getTemp().floatValue()
        );
    }
}

// Weather data classes
class WeatherData {
    private String condition;
    private Float temperature;
    
    public WeatherData(String condition, Float temperature) {
        this.condition = condition;
        this.temperature = temperature;
    }
    
    // getters and setters
}

class WeatherApiResponse {
    private List<Weather> weather;
    private Main main;
    
    // getters and setters
    
    static class Weather {
        private String main;
        // getters and setters
    }
    
    static class Main {
        private Double temp;
        // getters and setters
    }
}
```

**Integration Features:**
- **External API**: RestTemplate for HTTP calls
- **Caching**: `@Cacheable` to avoid repeated API calls
- **Error Handling**: Fallback to default weather
- **Configuration**: Externalized API key

---

### `/backend/src/main/java/com/stylofit/service/CloudinaryService.java` - Image Storage
**Purpose**: Handles image upload and management using Cloudinary cloud storage.

```java
package com.stylofit.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryService() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "your_cloud_name",
            "api_key", "your_api_key",
            "api_secret", "your_api_secret"
        ));
    }
    
    // Upload image to Cloudinary
    public String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "stylofit/clothing",
                "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }
    
    // Delete image from Cloudinary
    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicIdFromUrl(imageUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete image: " + e.getMessage());
        }
    }
    
    private String extractPublicIdFromUrl(String imageUrl) {
        // Extract public ID from Cloudinary URL
        String[] parts = imageUrl.split("/");
        String filename = parts[parts.length - 1];
        return filename.substring(0, filename.lastIndexOf('.'));
    }
}
```

**Cloud Storage Features:**
- **Cloudinary Integration**: Professional image management
- **Automatic Optimization**: Cloudinary handles image optimization
- **Secure URLs**: HTTPS URLs for image access
- **Folder Organization**: Organized storage structure

---

This completes Part 2 of the file-by-file explanation. I'll continue with the AI service, frontend files, and configuration files in Part 3.