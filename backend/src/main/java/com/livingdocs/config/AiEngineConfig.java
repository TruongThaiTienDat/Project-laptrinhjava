package com.livingdocs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AiEngineConfig {

    @Bean(name = "aiEngineWebClient")
    public WebClient aiEngineWebClient(
            @Value("${livingdocs.ai-engine.base-url:http://localhost:8000}") String baseUrl,
            @Value("${livingdocs.ai-engine.max-in-memory-mb:10}") int maxInMemoryMb) {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(maxInMemoryMb * 1024 * 1024))
                .build();
        return WebClient.builder()
                .baseUrl(baseUrl)
                .exchangeStrategies(strategies)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}