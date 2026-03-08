package com.example.trackingservice.dto;

import lombok.Data;

@Data
public class LogRequest {
    private String habitId;
    private Long userId;
}