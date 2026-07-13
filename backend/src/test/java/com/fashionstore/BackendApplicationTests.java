package com.fashionstore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import com.fashionstore.config.EnvLoaderInitializer;
import com.fashionstore.service.EmailService;

@SpringBootTest
@ContextConfiguration(initializers = EnvLoaderInitializer.class)
class BackendApplicationTests {

	@Autowired
	private EmailService emailService;

	@Test
	void testEmailSend() {
		System.out.println(">>> STARTING EMAIL SEND TEST...");
		try {
			emailService.sendEmail("onnikamshruti27@gmail.com", "Test Email from Spring Boot", "Hello! This is a test email sent from the local Spring Boot application using your credentials.");
			System.out.println(">>> EMAIL SEND TEST DISPATCHED (Waiting for async dispatch)...");
			Thread.sleep(8000);
			System.out.println(">>> EMAIL SEND TEST COMPLETED successfully (no exception thrown).");
		} catch (Exception e) {
			System.out.println(">>> EMAIL SEND TEST FAILED!");
			e.printStackTrace();
		}
	}
}
