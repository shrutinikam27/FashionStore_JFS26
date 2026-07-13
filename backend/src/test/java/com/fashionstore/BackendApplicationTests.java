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
			byte[] mockAttachment = "Hello World PDF invoice mockup".getBytes();
			emailService.sendEmailWithAttachment("nikamshruti27@gmail.com", "Test Email with Attachment", "Hello! This is a test email with attachment.", mockAttachment, "invoice-test.pdf");
			System.out.println(">>> EMAIL SEND TEST DISPATCHED (Waiting for async dispatch)...");
			Thread.sleep(8000);
			System.out.println(">>> EMAIL SEND TEST COMPLETED successfully (no exception thrown).");
		} catch (Exception e) {
			System.out.println(">>> EMAIL SEND TEST FAILED!");
			e.printStackTrace();
		}
	}
}
