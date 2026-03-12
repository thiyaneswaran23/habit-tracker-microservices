package com.example.trackingservice.repository;

import com.example.trackingservice.entity.HabitLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends MongoRepository<HabitLog, String> {
    List<HabitLog> findByUserId(Long userId);
    List<HabitLog> findByHabitIdOrderByCompletionDateDesc(String habitId);
    Optional<HabitLog> findByHabitIdAndCompletionDate(String habitId, LocalDate date);
}