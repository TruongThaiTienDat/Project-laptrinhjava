
package com.livingdocs.service;

import com.livingdocs.exception.AiEngineException;
import com.livingdocs.payload.ai.AiEngineResult;
import com.livingdocs.payload.ai.AiGenerateRequest;
import com.livingdocs.payload.ai.AiUpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.Exceptions;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class AiEngineClientService {

    private static final Logger log = LoggerFactory.getLogger(AiEngineClientService.class);

    static final String GENERATE_PATH = "/api/v1/documents/generate";
    static final String UPDATE_PATH = "/api/v1/documents/update";
    static final String HEALTH_PATH = "/health";

    private final WebClient aiWebClient;
    private final Duration timeout;
    private final int maxRetries;

    public AiEngineClientService(
            @Qualifier("aiEngineWebClient") WebClient aiWebClient,
            @Value("${livingdocs.ai-engine.timeout-seconds:60}") long timeoutSeconds,
            @Value("${livingdocs.ai-engine.max-retries:2}") int maxRetries) {
        this.aiWebClient = aiWebClient;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
        this.maxRetries = maxRetries;
    }

    public AiEngineResult generateDocumentation(AiGenerateRequest request) {
        return post(GENERATE_PATH, request);
    }

    public AiEngineResult updateDocumentation(AiUpdateRequest request) {
        return post(UPDATE_PATH, request);
    }

    public boolean isHealthy() {
        try {
            Map<?, ?> body = aiWebClient.get()
                    .uri(HEALTH_PATH)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(5));

            return body != null && "ok".equals(body.get("status"));
        } catch (Exception e) {
            log.warn("AI Engine health check failed: {}", e.getMessage());
            return false;
        }
    }

    private AiEngineResult post(String path, Object body) {
        try {
            AiEngineResult result = aiWebClient.post()
                    .uri(path)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), resp ->
                            resp.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .map(msg -> new AiEngineException(
                                            "AI Engine rejected request: " + msg,
                                            HttpStatus.BAD_GATEWAY, false)))
                    .onStatus(status -> status.is5xxServerError(), resp ->
                            resp.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .map(msg -> new AiEngineException(
                                            "AI Engine internal error: " + msg,
                                            HttpStatus.BAD_GATEWAY, true)))
                    .bodyToMono(AiEngineResult.class)
                    .timeout(timeout)
                    .retryWhen(Retry.backoff(maxRetries, Duration.ofSeconds(1))
                            .filter(this::isRetryable)
                            .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                    .block(timeout.multipliedBy(maxRetries + 1L).plusSeconds(30));

            return validate(result);

        } catch (AiEngineException e) {
            throw e;
        } catch (WebClientRequestException e) {
            throw new AiEngineException("Cannot reach AI Engine: " + e.getMessage(),
                    HttpStatus.SERVICE_UNAVAILABLE, true, e);
        } catch (IllegalStateException e) {
            throw new AiEngineException("AI Engine timed out after " + timeout.toSeconds() + "s",
                    HttpStatus.GATEWAY_TIMEOUT, true, e);
        } catch (RuntimeException e) {
            if (Exceptions.unwrap(e) instanceof TimeoutException) {
                throw new AiEngineException("AI Engine timed out after " + timeout.toSeconds() + "s",
                        HttpStatus.GATEWAY_TIMEOUT, true, e);
            }
            throw e;
        }
    }

    private boolean isRetryable(Throwable t) {
        if (t instanceof AiEngineException ae) {
            return ae.isRetryable();
        }
        return t instanceof WebClientRequestException;
    }

    private AiEngineResult validate(AiEngineResult result) {
        if (result == null || result.content() == null || result.content().isBlank()) {
            throw new AiEngineException("AI Engine returned empty content",
                    HttpStatus.BAD_GATEWAY, false);
        }

        Double score = result.confidenceScore();
        if (score == null || score < 0.0 || score > 1.0) {
            throw new AiEngineException("AI Engine returned invalid confidence_score: " + score,
                    HttpStatus.BAD_GATEWAY, false);
        }

        return result;
    }
}
