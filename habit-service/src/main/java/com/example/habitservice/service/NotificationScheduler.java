package com.example.habitservice.service;

import com.example.habitservice.entity.Habit;
import com.example.habitservice.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@EnableScheduling
public class NotificationScheduler {

    @Autowired
    private HabitRepository habitRepository;

    // Runs every 60 seconds
    @Scheduled(cron = "0 * * * * *")
    public void checkAndSendReminders() {
        LocalTime now = LocalTime.now();
        String currentTime = now.format(DateTimeFormatter.ofPattern("HH:mm"));

        List<Habit> habitsToNotify = habitRepository.findByReminderTimeAndActive(currentTime, true);

        for (Habit habit : habitsToNotify) {
            // In a real app, you'd call an EmailService or PushNotificationService here
            System.out.println("NOTIFICATION: User " + habit.getUserId() +
                    ", it's time to: " + habit.getName());
        }
    }
}