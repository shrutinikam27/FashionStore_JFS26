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

    @Value("${resend.from.email:Fashion Store <onboarding@resend.dev>}")
    private String resendFromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        String originalRecipient = to;
        to = "onnikamshruti27@gmail.com";
        body = body + "\n\n--- [Redirected for Testing] ---\nOriginal Recipient: " + originalRecipient;

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
                saveEmailToFile(to, subject, body, null, null);
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

        printMockEmail(to, subject, body, null, null);
    }

    @Async
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        String originalRecipient = to;
        to = "onnikamshruti27@gmail.com";
        body = body + "\n\n--- [Redirected for Testing] ---\nOriginal Recipient: " + originalRecipient;

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
                saveEmailToFile(to, subject, body, attachmentBytes, attachmentName);
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

        printMockEmail(to, subject, body, attachmentBytes, attachmentName);
    }

    private void printMockEmail(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        System.out.println("==================================================");
        System.out.println("MOCK EMAIL DISPATCH (Fallback: SMTP not configured)");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Content:");
        System.out.println(body);
        if (attachmentBytes != null && attachmentName != null) {
            System.out.println("Attachment: " + attachmentName + " (" + attachmentBytes.length + " bytes)");
        }
        System.out.println("==================================================");
        saveEmailToFile(to, subject, body, attachmentBytes, attachmentName);
    }

    private void saveEmailToFile(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        try {
            java.nio.file.Path emailFolder = java.nio.file.Paths.get("dispatched_emails");
            java.nio.file.Files.createDirectories(emailFolder);
            
            String filename = "email_" + System.currentTimeMillis() + "_" + to.replaceAll("[^a-zA-Z0-9.-]", "_") + ".txt";
            java.nio.file.Path emailFile = emailFolder.resolve(filename);
            
            StringBuilder sb = new StringBuilder();
            sb.append("==================================================\n");
            sb.append("To: ").append(to).append("\n");
            sb.append("Subject: ").append(subject).append("\n");
            sb.append("Date: ").append(java.time.LocalDateTime.now()).append("\n");
            sb.append("==================================================\n\n");
            sb.append(body).append("\n\n");
            
            if (attachmentBytes != null && attachmentName != null) {
                sb.append("==================================================\n");
                sb.append("Attachment: ").append(attachmentName).append(" (").append(attachmentBytes.length).append(" bytes)\n");
                sb.append("==================================================\n");
                
                String attachFilename = "attachment_" + System.currentTimeMillis() + "_" + attachmentName;
                java.nio.file.Path attachFile = emailFolder.resolve(attachFilename);
                java.nio.file.Files.write(attachFile, attachmentBytes);
                sb.append("Saved attachment file to: ").append(attachFile.toAbsolutePath()).append("\n");
            }
            
            java.nio.file.Files.writeString(emailFile, sb.toString());
            System.out.println(">>> DEVELOPER TOOL: Dispatched email content saved to local file: " + emailFile.toAbsolutePath());
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to save email to local file: " + e.getMessage());
        }
    }

    private void sendEmailViaResend(String to, String subject, String body, byte[] attachmentBytes, String attachmentName) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + resendApiKey);

            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("from", resendFromEmail);
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
            saveEmailToFile(to, subject, body, attachmentBytes, attachmentName);
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to send email via Resend API. Reason: " + e.getMessage());
            e.printStackTrace();
            printMockEmail(to, subject, body, attachmentBytes, attachmentName);
        }
    }
}
