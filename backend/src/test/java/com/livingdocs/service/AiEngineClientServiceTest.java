package com.livingdocs.service;

import com.livingdocs.exception.AiEngineException;
import com.livingdocs.payload.ai.AiEngineResult;
import com.livingdocs.payload.ai.AiGenerateRequest;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class AiEngineClientServiceTest {

    private static final String OK_BODY = """
            {"content":"# Doc","confidence_score":0.8,
             "grounding_evidence":[{"file_path":"A.java","code_entity":"A","commit_hash":"abc"}],
             "model":"test"}""";

    private MockWebServer server;

    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
    }

    @AfterEach
    void tearDown() throws IOException {
        server.shutdown();
    }

    private AiEngineClientService client(long timeoutSeconds, int retries) {
        WebClient wc = WebClient.builder()
                .baseUrl(server.url("/").toString())
                .defaultHeader("Content-Type", "application/json")
                .build();
        return new AiEngineClientService(wc, timeoutSeconds, retries);
    }

    private AiGenerateRequest req() {
        return new AiGenerateRequest(1L, "A.java", "java", "class A {}", null, "abc");
    }

    private MockResponse json(String body) {
        return new MockResponse().setHeader("Content-Type", "application/json").setBody(body);
    }

    @Test
    void generate_success() throws Exception {
        server.enqueue(json(OK_BODY));

        AiEngineResult r = client(5, 0).generateDocumentation(req());

        assertEquals("# Doc", r.content());
        assertEquals(0.8, r.confidenceScore());
        assertEquals(1, r.groundingEvidence().size());
        var recorded = server.takeRequest(1, TimeUnit.SECONDS);
        assertEquals("/api/v1/documents/generate", recorded.getPath());
        assertTrue(recorded.getBody().readUtf8().contains("\"document_id\":1"));
    }

    @Test
    void serverError_isRetried_thenSucceeds() {
        server.enqueue(new MockResponse().setResponseCode(500).setBody("boom"));
        server.enqueue(json(OK_BODY));

        AiEngineResult r = client(5, 1).generateDocumentation(req());

        assertEquals("# Doc", r.content());
        assertEquals(2, server.getRequestCount());
    }

    @Test
    void serverError_exhaustsRetries_returnsBadGateway() {
        server.enqueue(new MockResponse().setResponseCode(500).setBody("boom"));
        server.enqueue(new MockResponse().setResponseCode(500).setBody("boom"));

        AiEngineException ex = assertThrows(AiEngineException.class,
                () -> client(5, 1).generateDocumentation(req()));

        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatus());
        assertEquals(2, server.getRequestCount());
    }

    @Test
    void clientError_isNotRetried() {
        server.enqueue(new MockResponse().setResponseCode(422).setBody("bad"));

        AiEngineException ex = assertThrows(AiEngineException.class,
                () -> client(5, 2).generateDocumentation(req()));

        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatus());
        assertFalse(ex.isRetryable());
        assertEquals(1, server.getRequestCount());
    }

    @Test
    void emptyContent_isRejected() {
        server.enqueue(json("{\"content\":\"\",\"confidence_score\":0.5,\"grounding_evidence\":[],\"model\":\"m\"}"));

        assertThrows(AiEngineException.class, () -> client(5, 0).generateDocumentation(req()));
    }

    @Test
    void invalidConfidence_isRejected() {
        server.enqueue(json("{\"content\":\"x\",\"confidence_score\":1.7,\"grounding_evidence\":[],\"model\":\"m\"}"));

        AiEngineException ex = assertThrows(AiEngineException.class,
                () -> client(5, 0).generateDocumentation(req()));
        assertTrue(ex.getMessage().contains("confidence_score"));
    }

    @Test
    void slowResponse_returnsGatewayTimeout() {
        server.enqueue(json(OK_BODY).setBodyDelay(4, TimeUnit.SECONDS));

        AiEngineException ex = assertThrows(AiEngineException.class,
                () -> client(1, 0).generateDocumentation(req()));

        assertEquals(HttpStatus.GATEWAY_TIMEOUT, ex.getStatus());
    }

    @Test
    void engineDown_returnsServiceUnavailable() throws IOException {
        AiEngineClientService c = client(2, 0);
        server.shutdown();

        AiEngineException ex = assertThrows(AiEngineException.class, () -> c.generateDocumentation(req()));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatus());
    }

    @Test
    void health_upAndDown() throws IOException {
        server.enqueue(json("{\"status\":\"ok\"}"));
        AiEngineClientService c = client(2, 0);
        assertTrue(c.isHealthy());

        server.shutdown();
        assertFalse(c.isHealthy());
    }
}