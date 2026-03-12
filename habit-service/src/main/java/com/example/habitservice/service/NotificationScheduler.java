package com.example.habitservice.service;

import com.example.habitservice.entity.Habit;
import com.example.habitservice.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@EnableScheduling
public class NotificationScheduler {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private RestTemplate restTemplate;
    private EmailService emailService;
    @Scheduled(cron = "0 * * * * *")
    public void checkAndSendReminders() {
        String currentTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        String currentDay = LocalDate.now().getDayOfWeek().name();
        String currentDayOfMonth = String.valueOf(LocalDate.now().getDayOfMonth());

        List<Habit> habitsToNotify = habitRepository.findHabitsToNotify(currentTime, currentDay, currentDayOfMonth);

        for (Habit habit : habitsToNotify) {
            try {

                Map<String, Object> user = restTemplate.getForObject(
                        "http://USER-SERVICE/users/" + habit.getUserId(),
                        Map.class
                );

                if (user != null && user.get("email") != null) {
                    String email = (String) user.get("email");
                    String username = (String) user.get("username");

                    emailService.sendReminderEmail(email, username, habit.getName());

                    System.out.println("Email sent to: " + email + " for habit: " + habit.getName());
                }
            } catch (Exception e) {
                System.err.println("Failed" + e.getMessage());
            }
        }
    }
}