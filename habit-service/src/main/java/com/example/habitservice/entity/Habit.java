package com.example.habitservice.entity;


import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "habits")

public class Habit {
    @Id
    private String id;
    private Long userId;
    private String name;
    private String category;
    private String reminderTime;
    private boolean active = true;
    private String frequency; // "Daily", "Weekly", "Monthly"
    private String frequencyValue;
    @Transient
    private int streak;

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    public String getFrequencyValue() {
        return frequencyValue;
    }

    public void setFrequencyValue(String frequencyValue) {
        this.frequencyValue = frequencyValue;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    @Transient
    private boolean completedToday;

    // Add Getter and Setter for completedToday
    public boolean isCompletedToday() { return completedToday; }
    public void setCompletedToday(boolean completedToday) { this.completedToday = completedToday; }
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(String reminderTime) {
        this.reminderTime = reminderTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
