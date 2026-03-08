package com.example.habitservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class HabitServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HabitServiceApplication.class, args);
    }

}
