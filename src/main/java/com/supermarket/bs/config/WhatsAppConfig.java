package com.supermarket.bs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "whatsapp.green-api")
@Data
public class WhatsAppConfig {
    private String instanceId;
    private String apiToken;
    private boolean enabled;
    private String baseUrl;
    private String notificationUrl;
}