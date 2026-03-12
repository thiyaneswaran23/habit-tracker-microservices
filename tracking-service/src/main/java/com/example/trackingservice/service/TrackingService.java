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

    public int calculateStreak(String habitId, String frequency) {
        // Get logs sorted by date (Newest first)
        List<HabitLog> logs = logRepository.findByHabitIdOrderByCompletionDateDesc(habitId);
        if (logs.isEmpty()) return 0;

        int streak = 0;
        LocalDate today = LocalDate.now();

        LocalDate periodToCheck = today;

        for (HabitLog log : logs) {
            LocalDate logDate = log.getCompletionDate();

            if (isSamePeriod(logDate, periodToCheck, frequency)) {
                streak++;

                periodToCheck = getPreviousPeriod(periodToCheck, frequency);
            }

            else if (logDate.isAfter(periodToCheck)) {
                continue;
            }
            else {

                if (isSamePeriod(today, periodToCheck, frequency)) {
                    periodToCheck = getPreviousPeriod(periodToCheck, frequency);

                    if (isSamePeriod(logDate, periodToCheck, frequency)) {
                        streak++;
                        periodToCheck = getPreviousPeriod(periodToCheck, frequency);
                        continue;
                    }
                }
                break;
            }
        }
        return streak;
    }

    private boolean isSamePeriod(LocalDate date1, LocalDate date2, String frequency) {
        return switch (frequency) {
            case "Weekly" -> date1.minusWeeks(0).with(java.time.DayOfWeek.MONDAY)
                    .equals(date2.with(java.time.DayOfWeek.MONDAY));
            case "Monthly" -> date1.getMonth() == date2.getMonth() && date1.getYear() == date2.getYear();
            default -> date1.equals(date2);
        };
    }

    private LocalDate getPreviousPeriod(LocalDate date, String frequency) {
        return switch (frequency) {
            case "Weekly" -> date.minusWeeks(1);
            case "Monthly" -> date.minusMonths(1);
            default -> date.minusDays(1);
        };
    }
}