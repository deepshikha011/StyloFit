package com.stylofit.service;

import com.stylofit.entity.User;
import com.stylofit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final String AI_SERVICE_URL = "http://localhost:5000";
    
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        return userRepository.save(user);
    }
    
    public User findByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    
    public User updateUserProfile(Long userId, User userUpdate) {
        User existingUser = findByUserId(userId);
        existingUser.setFullName(userUpdate.getFullName());
        existingUser.setPreferredStyle(userUpdate.getPreferredStyle());
        return userRepository.save(existingUser);
    }
    
    public User analyzeFaceFeatures(Long userId, String imageUrl) {
        User user = findByUserId(userId);
        
        try {
            Map<String, String> faceAnalysis = restTemplate.postForObject(
                AI_SERVICE_URL + "/analyze-face",
                Map.of("image_url", imageUrl),
                Map.class
            );
            
            user.setFaceShape(faceAnalysis.get("face_shape"));
            user.setSkinTone(faceAnalysis.get("skin_tone"));
            
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Face analysis failed: " + e.getMessage());
        }
    }
}