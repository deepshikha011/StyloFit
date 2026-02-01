package com.stylofit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "outfit_recommendations")
@Data
public class OutfitRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recommendationId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToMany
    @JoinTable(
        name = "recommendation_items",
        joinColumns = @JoinColumn(name = "recommendation_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    private List<ClothingItem> recommendedItems;
    
    private String occasionRequested;
    private String weatherCondition;
    private Double temperature;
    private String styleReason;
    private Double matchingScore;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}