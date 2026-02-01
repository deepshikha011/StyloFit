package com.stylofit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "clothing_items")
@Data
public class ClothingItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String itemName;
    
    @Enumerated(EnumType.STRING)
    private ClothingType clothingType;
    
    private String primaryColor;
    private String secondaryColor;
    private String material;
    private String brand;
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    private WeatherSuitability weatherSuitability;
    
    @Enumerated(EnumType.STRING)
    private OccasionType occasionType;
    
    private Double aiConfidenceScore;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum ClothingType {
        SHIRT, T_SHIRT, POLO_SHIRT, BLOUSE, TANK_TOP,
        JEANS, TROUSERS, SHORTS, SKIRT, DRESS,
        JACKET, BLAZER, HOODIE, SWEATER, CARDIGAN,
        SNEAKERS, FORMAL_SHOES, BOOTS, SANDALS, HEELS,
        ACCESSORIES, BELT, WATCH, JEWELRY
    }
    
    public enum WeatherSuitability {
        HOT, WARM, COOL, COLD, RAINY, ALL_WEATHER
    }
    
    public enum OccasionType {
        CASUAL, BUSINESS, FORMAL, PARTY, SPORTS, BEACH, DATE
    }
}