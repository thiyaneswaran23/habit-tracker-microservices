package com.example.analyticsservice.controller;


import com.example.analyticsservice.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Add this to your AnalyticsController.java
    @GetMapping("/global/categories")
    public List<Map> getCategories() {
        return analyticsService.getGlobalCategoryStats();
    }

    @GetMapping("/user/{userId}/performance")
    public List<Map> getPerformance(@PathVariable Long userId) {
        return analyticsService.getCategorySuccessRate(userId);
    }

    @GetMapping("/user/{userId}/heatmap")
    public List<Map> getHeatmap(@PathVariable Long userId) {
        return analyticsService.getWeeklyHeatmap(userId);
    }
}