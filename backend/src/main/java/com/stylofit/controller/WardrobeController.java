package com.stylofit.controller;

import com.stylofit.entity.ClothingItem;
import com.stylofit.service.WardrobeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/wardrobe")
@CrossOrigin(origins = "*")
public class WardrobeController {
    
    @Autowired
    private WardrobeService wardrobeService;
    
    @PostMapping("/upload")
    public ResponseEntity<ClothingItem> uploadClothingItem(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("itemName") String itemName) {
        ClothingItem item = wardrobeService.uploadAndAnalyzeClothing(file, userId, itemName);
        return ResponseEntity.ok(item);
    }
    
    @PostMapping("/add-manual")
    public ResponseEntity<ClothingItem> addClothingItemManually(@RequestBody ClothingItem item) {
        ClothingItem savedItem = wardrobeService.saveClothingItem(item);
        return ResponseEntity.ok(savedItem);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClothingItem>> getUserWardrobe(@PathVariable Long userId) {
        List<ClothingItem> wardrobe = wardrobeService.getUserWardrobe(userId);
        return ResponseEntity.ok(wardrobe);
    }
    
    @GetMapping("/user/{userId}/filter")
    public ResponseEntity<List<ClothingItem>> getFilteredWardrobe(
            @PathVariable Long userId,
            @RequestParam(required = false) String occasionType,
            @RequestParam(required = false) String weatherSuitability) {
        List<ClothingItem> filteredItems = wardrobeService.getFilteredWardrobe(userId, occasionType, weatherSuitability);
        return ResponseEntity.ok(filteredItems);
    }
    
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteClothingItem(@PathVariable Long itemId) {
        wardrobeService.deleteClothingItem(itemId);
        return ResponseEntity.ok().build();
    }
}