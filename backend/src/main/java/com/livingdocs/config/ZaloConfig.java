package com.livingdocs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ZaloConfig {

    @Bean
    public WebClient zaloWebClient() {
        return WebClient.builder()
                .baseUrl("https://openapi.zalo.me/v3.0/oa")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
