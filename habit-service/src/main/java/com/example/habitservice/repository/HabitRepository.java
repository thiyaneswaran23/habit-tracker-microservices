package com.example.habitservice.repository;

import com.example.habitservice.entity.Habit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HabitRepository extends MongoRepository<Habit, String> {

    List<Habit> findByUserId(Long userId);
    @Query("{ 'reminderTime': ?0, 'active': true, " +
            "$or: [ " +
            "  { 'frequency': 'Daily' }, " +
            "  { 'frequency': 'Weekly', 'frequencyValue': ?1 }, " +
            "  { 'frequency': 'Monthly', 'frequencyValue': ?2 } " +
            "] }")
    List<Habit> findHabitsToNotify(String reminderTime, String currentDay, String currentDayOfMonth);
}