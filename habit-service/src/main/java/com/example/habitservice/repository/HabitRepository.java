package com.example.habitservice.repository;

import com.example.habitservice.entity.Habit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HabitRepository extends MongoRepository<Habit, String> {
    // This finds all habits for a specific user
    List<Habit> findByUserId(Long userId);

    // This finds habits that need notifications right now
    List<Habit> findByReminderTimeAndActive(String reminderTime, boolean active);
}