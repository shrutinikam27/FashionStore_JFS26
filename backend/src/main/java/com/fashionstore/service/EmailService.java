package com.fashionstore.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:${spring.mail.username}}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {

        if (mailSender == null) {
            System.err.println("JavaMailSender is not configured.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            System.out.println("========================================");
            System.out.println("EMAIL SENT SUCCESSFULLY");
            System.out.println("From : " + fromEmail);
            System.out.println("To   : " + to);
            System.out.println("========================================");

        } catch (Exception e) {
            System.err.println("EMAIL FAILED");
            e.printStackTrace();
        }
    }

    @Async
    public void sendEmailWithAttachment(
            String to,
            String subject,
            String body,
            byte[] attachmentBytes,
            String attachmentName) {

        if (mailSender == null) {
            System.err.println("JavaMailSender is not configured.");
            return;
        }

        try {

            MimeMessage mimeMessage = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            if (attachmentBytes != null
                    && attachmentBytes.length > 0
                    && attachmentName != null) {

                helper.addAttachment(
                        attachmentName,
                        new ByteArrayResource(attachmentBytes));
            }

            mailSender.send(mimeMessage);

            System.out.println("========================================");
            System.out.println("EMAIL WITH ATTACHMENT SENT");
            System.out.println("From : " + fromEmail);
            System.out.println("To   : " + to);
            System.out.println("========================================");

        } catch (Exception e) {
            System.err.println("EMAIL FAILED");
            e.printStackTrace();
        }
    }
}