package com.stylofit.controller;

import com.stylofit.entity.User;
import com.stylofit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userService.findByUserId(userId);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{userId}/profile")
    public ResponseEntity<User> updateUserProfile(@PathVariable Long userId, @RequestBody User userUpdate) {
        User updatedUser = userService.updateUserProfile(userId, userUpdate);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping("/{userId}/analyze-face")
    public ResponseEntity<User> analyzeFaceFeatures(@PathVariable Long userId, @RequestParam String imageUrl) {
        User updatedUser = userService.analyzeFaceFeatures(userId, imageUrl);
        return ResponseEntity.ok(updatedUser);
    }
}