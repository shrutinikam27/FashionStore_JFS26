package com.fashionstore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:info@fashionstore.com}")
    private String fromEmail;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        boolean hasSmtp = mailSender != null && fromEmail != null && !fromEmail.trim().isEmpty() && !fromEmail.contains("YOUR_GMAIL");
        
        if (hasSmtp) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println(">>> SUCCESS: Real email dispatched to " + to + " via SMTP");
                return;
            } catch (Exception e) {
                System.err.println(">>> ERROR: Failed to send real email via SMTP. Reason: " + e.getMessage());
                e.printStackTrace();
            }
        }

        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            sendEmailViaResend(to, subject, body, null, null);
            return;
        }

        printMockEmail(to, subject, body);
    }

    @Async
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        boolean hasSmtp = mailSender != null && fromEmail != null && !fromEmail.trim().isEmpty() && !fromEmail.contains("YOUR_GMAIL");

        if (hasSmtp) {
            try {
                jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
                org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true);
                helper.setFrom(fromEmail, "Fashion Store");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(body);
                
                org.springframework.core.io.ByteArrayResource byteArrayResource = new org.springframework.core.io.ByteArrayResource(attachmentBytes);
                helper.addAttachment(attachmentName, byteArrayResource);
                
                mailSender.send(message);
                System.out.println(">>> SUCCESS: Real email with attachment dispatched to " + to + " via SMTP");
                return;
            } catch (Exception e) {
                System.err.println(">>> ERROR: Failed to send real email with attachment via SMTP. Reason: " + e.getMessage());
                e.printStackTrace();
            }
        }

        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            sendEmailViaResend(to, subject, body, attachmentBytes, attachmentName);
            return;
        }

        printMockEmail(to, subject, body + "\n[Attachment: " + attachmentName + " (" + attachmentBytes.length + " bytes)]");
    }

    private void printMockEmail(String to, String subject, String body) {
        System.out.println("==================================================");
        System.out.println("MOCK EMAIL DISPATCH (Fallback: SMTP not configured)");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Content:");
        System.out.println(body);
        System.out.println("==================================================");
    }

    private void sendEmailViaResend(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey);

            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("from", "Fashion Store <onboarding@resend.dev>");
            payload.put("to", java.util.List.of(to));
            payload.put("subject", subject);
            
            String htmlContent = "<h3>Fashion Store Notification</h3><p>" + body.replace("\n", "<br/>") + "</p>";
            payload.put("html", htmlContent);

            if (attachmentBytes != null && attachmentName != null) {
                String base64Content = java.util.Base64.getEncoder().encodeToString(attachmentBytes);
                java.util.Map<String, String> attachment = new java.util.HashMap<>();
                attachment.put("filename", attachmentName);
                attachment.put("content", base64Content);
                payload.put("attachments", java.util.List.of(attachment));
            }

            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(payload, headers);
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);
            
            System.out.println(">>> SUCCESS: Email sent via Resend HTTP API. Status: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to send email via Resend API. Reason: " + e.getMessage());
            e.printStackTrace();
            printMockEmail(to, subject, body);
        }
    }
}
