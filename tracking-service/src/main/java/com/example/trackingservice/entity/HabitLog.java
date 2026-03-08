package com.example.trackingservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "habit_logs")
public class HabitLog {
    @Id
    private String id;
    private String habitId; // Links to Habit-Service
    private Long userId;    // Links to User-Service
    private LocalDate completionDate;
    private boolean completed = true;
}
