package com.fashionstore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class EmailService {

    public record MockEmail(String to, String subject, String body, String timestamp) {}

    private final JavaMailSender mailSender;
    private final List<MockEmail> mockEmails = Collections.synchronizedList(new ArrayList<>());

    @Value("${spring.mail.username:info@fashionstore.com}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public List<MockEmail> getMockEmails() {
        return new ArrayList<>(mockEmails);
    }

    public void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            printMockEmail(to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String from = (fromEmail != null && !fromEmail.contains("YOUR_GMAIL")) ? fromEmail : "info@fashionstore.com";
            message.setFrom("Fashion Store <" + from + ">");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println(">>> SUCCESS: Real email dispatched to " + to);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to send real email. Reason: " + e.getMessage());
            e.printStackTrace();
            // Graceful fallback to console logs when SMTP is unconfigured locally
            printMockEmail(to, subject, body);
        }
    }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        if (mailSender == null) {
            printMockEmail(to, subject, body + "\n[Attachment: " + attachmentName + " (" + attachmentBytes.length + " bytes)]");
            return;
        }

        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
            String from = (fromEmail != null && !fromEmail.contains("YOUR_GMAIL")) ? fromEmail : "info@fashionstore.com";
            helper.setFrom(from, "Fashion Store");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            
            org.springframework.core.io.ByteArrayResource byteArrayResource = new org.springframework.core.io.ByteArrayResource(attachmentBytes);
            helper.addAttachment(attachmentName, byteArrayResource);
            
            mailSender.send(message);
            System.out.println(">>> SUCCESS: Real email with attachment dispatched to " + to);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to send real email with attachment. Reason: " + e.getMessage());
            e.printStackTrace();
            // Graceful fallback to console logs when SMTP is unconfigured locally
            printMockEmail(to, subject, body + "\n[Attachment: " + attachmentName + " (" + attachmentBytes.length + " bytes)]");
        }
    }

    private void printMockEmail(String to, String subject, String body) {
        mockEmails.add(new MockEmail(to, subject, body, LocalDateTime.now().toString()));
        System.out.println("==================================================");
        System.out.println("MOCK EMAIL DISPATCH (Fallback: SMTP not configured)");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Content:");
        System.out.println(body);
        System.out.println("==================================================");
    }
}
