package com.stylofit.controller;

import com.stylofit.entity.OutfitRecommendation;
import com.stylofit.service.OutfitRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class OutfitRecommendationController {
    
    @Autowired
    private OutfitRecommendationService recommendationService;
    
    @PostMapping("/generate")
    public ResponseEntity<OutfitRecommendation> generateOutfitRecommendation(
            @RequestParam Long userId,
            @RequestParam String occasion,
            @RequestParam(required = false) String location) {
        OutfitRecommendation recommendation = recommendationService.generateRecommendation(userId, occasion, location);
        return ResponseEntity.ok(recommendation);
    }
    
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<OutfitRecommendation>> getRecommendationHistory(@PathVariable Long userId) {
        List<OutfitRecommendation> history = recommendationService.getRecommendationHistory(userId);
        return ResponseEntity.ok(history);
    }
    
    @PostMapping("/{recommendationId}/feedback")
    public ResponseEntity<Void> provideFeedback(
            @PathVariable Long recommendationId,
            @RequestParam Double rating) {
        recommendationService.updateRecommendationRating(recommendationId, rating);
        return ResponseEntity.ok().build();
    }
}