package com.fashionstore.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EnvLoaderInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        String[] paths = {".env", "backend/.env", "../.env"};
        
        for (String path : paths) {
            if (Files.exists(Paths.get(path))) {
                try {
                    List<String> lines = Files.readAllLines(Paths.get(path));
                    Map<String, Object> envProps = new HashMap<>();
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip quotes if any
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            envProps.put(key, value);
                        }
                    }
                    if (!envProps.isEmpty()) {
                        environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", envProps));
                        System.out.println(">>> SUCCESS: Loaded environment variables from " + path);
                    }
                    break;
                } catch (IOException e) {
                    System.err.println(">>> ERROR: Failed to load .env file from " + path + ": " + e.getMessage());
                }
            }
        }
    }
}
