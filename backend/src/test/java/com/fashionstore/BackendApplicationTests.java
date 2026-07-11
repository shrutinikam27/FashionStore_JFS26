package com.fashionstore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import com.fashionstore.service.EmailService;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private EmailService emailService;

	@Test
	void testEmailSend() {
		System.out.println(">>> STARTING EMAIL SEND TEST...");
		try {
			emailService.sendEmail("nikamshruti27@gmail.com", "Test Email from Spring Boot", "Hello! This is a test email sent from the local Spring Boot application using your credentials.");
			System.out.println(">>> EMAIL SEND TEST COMPLETED successfully (no exception thrown).");
		} catch (Exception e) {
			System.out.println(">>> EMAIL SEND TEST FAILED!");
			e.printStackTrace();
		}
	}
}
