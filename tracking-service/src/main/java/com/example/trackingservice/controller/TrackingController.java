package com.example.trackingservice.controller;

import com.example.trackingservice.dto.LogRequest;
import com.example.trackingservice.entity.HabitLog;
import com.example.trackingservice.repository.HabitLogRepository;
import com.example.trackingservice.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/tracking")
public class TrackingController {

    @Autowired
    private HabitLogRepository logRepository;

    @Autowired
    private TrackingService streakService;

    // 1. Mark a habit as completed for TODAY using your DTO
    @PostMapping("/log")
    public ResponseEntity<?> logHabit(@RequestBody LogRequest request) {
        String habitId = request.getHabitId();
        Long userId = request.getUserId();
        LocalDate today = LocalDate.now();

        // 1. Check for existing log
        Optional<HabitLog> existingLog = logRepository.findByHabitIdAndCompletionDate(habitId, today);

        if (existingLog.isPresent()) {
            // Return 400 Bad Request if already logged
            return ResponseEntity.badRequest().body("Already logged for today!");
        }

        // 2. Create and save new log
        HabitLog log = new HabitLog();
        log.setHabitId(habitId);
        log.setUserId(userId);
        log.setCompletionDate(today);

        HabitLog savedLog = logRepository.save(log);
        return ResponseEntity.ok(savedLog);
    }

    // 2. Get the current streak
    @GetMapping("/streak/{habitId}")
    public ResponseEntity<Map<String, Integer>> getStreak(@PathVariable String habitId) {
        int streak = streakService.calculateStreak(habitId);
        return ResponseEntity.ok(Map.of("currentStreak", streak));
    }

    // 3. Get all logs for history view
    @GetMapping("/user/{userId}")
    public List<HabitLog> getUserLogs(@PathVariable Long userId) {
        return logRepository.findByUserId(userId);
    }
}