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
import java.util.Optional;

@RestController
@RequestMapping("/tracking")
public class TrackingController {

    @Autowired
    private HabitLogRepository logRepository;

    @Autowired
    private TrackingService trackingService;
    @GetMapping("/streak/{habitId}")
    public int getStreak(
            @PathVariable String habitId,
            @RequestParam(defaultValue = "Daily") String frequency) {
        return trackingService.calculateStreak(habitId, frequency);
    }

    @PostMapping("/log")
    public ResponseEntity<?> logHabit(@RequestBody LogRequest request) {
        String habitId = request.getHabitId();
        LocalDate today = LocalDate.now();
        Optional<HabitLog> existingLog = logRepository.findByHabitIdAndCompletionDate(habitId, today);

        if (existingLog.isPresent()) {
            return ResponseEntity.ok(existingLog.get());
        }

        HabitLog log = new HabitLog();
        log.setHabitId(habitId);
        log.setUserId(request.getUserId());
        log.setCompletionDate(today);

        return ResponseEntity.ok(logRepository.save(log));
    }
    @GetMapping("/status/{habitId}")
    public boolean getCompletionStatus(
            @PathVariable String habitId,
            @RequestParam(defaultValue = "Daily") String frequency) {

        List<HabitLog> logs = logRepository.findByHabitIdOrderByCompletionDateDesc(habitId);
        if (logs.isEmpty()) return false;

        LocalDate latestLog = logs.get(0).getCompletionDate();
        return isWithinCurrentPeriod(latestLog, frequency);
    }

    private boolean isWithinCurrentPeriod(LocalDate date, String frequency) {
        LocalDate today = LocalDate.now();
        return switch (frequency) {
            case "Weekly" -> !date.isBefore(today.with(java.time.DayOfWeek.MONDAY));
            case "Monthly" -> date.getMonth() == today.getMonth() && date.getYear() == today.getYear();
            default -> date.equals(today);
        };
    }
}