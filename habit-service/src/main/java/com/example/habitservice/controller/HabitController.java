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

    @GetMapping("/user/{userId}")
    public List<Habit> getUserHabits(@PathVariable Long userId) {
        return habitRepository.findByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteHabit(@PathVariable String id) {
        habitRepository.deleteById(id);
    }
}