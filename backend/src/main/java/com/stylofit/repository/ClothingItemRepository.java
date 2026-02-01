package com.stylofit.repository;

import com.stylofit.entity.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {
    List<ClothingItem> findByUserUserId(Long userId);
    
    List<ClothingItem> findByUserUserIdAndOccasionType(Long userId, ClothingItem.OccasionType occasionType);
    
    List<ClothingItem> findByUserUserIdAndWeatherSuitability(Long userId, ClothingItem.WeatherSuitability weatherSuitability);
    
    @Query("SELECT c FROM ClothingItem c WHERE c.user.userId = ?1 AND c.occasionType = ?2 AND c.weatherSuitability = ?3")
    List<ClothingItem> findByUserIdOccasionAndWeather(Long userId, ClothingItem.OccasionType occasion, ClothingItem.WeatherSuitability weather);
}