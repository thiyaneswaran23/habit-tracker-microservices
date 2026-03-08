package com.example.userservice.controller;

import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        user.setPassword(encoder.encode(user.getPassword())); // Encrypt password
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        User user = userRepository.findByEmail(credentials.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (encoder.matches(credentials.get("password"), user.getPassword())) {
            // In a full setup, generate a JWT token here
            return ResponseEntity.ok(Map.of("message", "Login Successful", "userId", user.getId()));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
