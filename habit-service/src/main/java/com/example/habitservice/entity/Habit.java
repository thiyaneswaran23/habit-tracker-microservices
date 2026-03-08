package com.example.habitservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "habits")
public class Habit {
    @Id
    private String id;
    private Long userId;
    private String name;
    private String category; // e.g., "Coding", "Fitness"
    private String reminderTime; // Format: "HH:mm" (e.g., "07:30")
    private boolean active = true;
}
