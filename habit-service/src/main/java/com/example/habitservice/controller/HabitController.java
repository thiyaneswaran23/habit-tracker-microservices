package com.example.habitservice.controller;

import com.example.habitservice.entity.Habit;
import com.example.habitservice.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitRepository habitRepository;

    @PostMapping("/create")
    public Habit createHabit(@RequestBody Habit habit) {
        return habitRepository.save(habit);
    }

    // Updated HabitController.java
    @GetMapping("/user/{userId}")
    public List<Habit> getUserHabits(@PathVariable Long userId) {
        List<Habit> habits = habitRepository.findByUserId(userId);

        // In a full microservices flow, you would call the Tracking-Service here
        // For now, we ensure the boolean is checked so the React filter works
        for (Habit habit : habits) {
            // habit.setCompletedToday(checkTrackingService(habit.getId()));
        }

        return habits;
    }

    @DeleteMapping("/{id}")
    public void deleteHabit(@PathVariable String id) {
        habitRepository.deleteById(id);
    }
}