package com.stylofit.repository;

import com.stylofit.entity.OutfitRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OutfitRecommendationRepository extends JpaRepository<OutfitRecommendation, Long> {
    List<OutfitRecommendation> findByUserUserIdOrderByCreatedAtDesc(Long userId);
}
