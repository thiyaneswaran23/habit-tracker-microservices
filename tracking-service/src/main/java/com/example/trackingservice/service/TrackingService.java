package com.example.trackingservice.service;

import com.example.trackingservice.entity.HabitLog;
import com.example.trackingservice.repository.HabitLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TrackingService {
    @Autowired
    private HabitLogRepository logRepository;

    public int calculateStreak(String habitId) {
        List<HabitLog> logs = logRepository.findByHabitIdOrderByCompletionDateDesc(habitId);
        if (logs.isEmpty()) return 0;

        int streak = 0;
        LocalDate lastLogDate = logs.get(0).getCompletionDate();
        LocalDate today = LocalDate.now();

        // Determine starting point: today or yesterday
        LocalDate expectedDate = lastLogDate.equals(today) ? today : today.minusDays(1);

        for (HabitLog log : logs) {
            if (log.getCompletionDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (log.getCompletionDate().isAfter(expectedDate)) {
                continue; // Ignore duplicate logs for the same day
            } else {
                break;
            }
        }
        return streak;
    }
}
