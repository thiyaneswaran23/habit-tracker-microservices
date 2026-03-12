package com.example.habitservice.controller;

import com.example.habitservice.entity.Habit;
import com.example.habitservice.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/create")
    public Habit createHabit(@RequestBody Habit habit) {
        return habitRepository.save(habit);
    }

    @GetMapping("/user/{userId}")
    public List<Habit> getUserHabits(@PathVariable Long userId) {
        List<Habit> habits = habitRepository.findByUserId(userId);

        for (Habit habit : habits) {
            try {

                String statusUrl = "http://TRACKING-SERVICE/tracking/status/" + habit.getId() + "?frequency=" + habit.getFrequency();
                Boolean isDone = restTemplate.getForObject(statusUrl, Boolean.class);
                habit.setCompletedToday(isDone != null && isDone);

                String streakUrl = "http://TRACKING-SERVICE/tracking/streak/" + habit.getId() + "?frequency=" + habit.getFrequency();
                Integer streak = restTemplate.getForObject(streakUrl, Integer.class);
                habit.setStreak(streak != null ? streak : 0);

            } catch (Exception e) {
                System.err.println("Communication Error" + habit.getName());
                habit.setCompletedToday(false);
                habit.setStreak(0);
            }
        }
        return habits;
    }

    @DeleteMapping("/{id}")
    public void deleteHabit(@PathVariable String id) {
        habitRepository.deleteById(id);
    }
}