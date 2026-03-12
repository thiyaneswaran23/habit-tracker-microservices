package com.example.habitservice.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendReminderEmail(String toEmail, String username, String habitName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("habitflow@rmk.ac.in");
        message.setTo(toEmail);
        message.setSubject("⏰ Time for your Ritual: " + habitName);
        message.setText("Hey " + username + ",\n\nDon't break the streak! It's time for: "
                + habitName + ".\n\nKeep going,\nHabitFlow");

        mailSender.send(message);
    }
}