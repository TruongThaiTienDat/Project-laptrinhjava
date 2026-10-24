package com.livingdocs.controller;

import com.livingdocs.exception.AiEngineException;
import com.livingdocs.exception.GlobalExceptionHandler;
import com.livingdocs.payload.ai.AiDocumentResponse;
import com.livingdocs.service.AiInteropService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AiInteropControllerTest {

    private AiInteropService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(AiInteropService.class);
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mvc = MockMvcBuilders.standaloneSetup(new AiInteropController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    private static final String VALID = "{\"filePath\":\"A.java\",\"language\":\"java\",\"sourceCode\":\"class A {}\"}";

    @Test
    void generate_ok() throws Exception {
        when(service.generate(eq(1L), any())).thenReturn(
                new AiDocumentResponse(1L, 1, "# Doc", 0.8, List.of(), true));

        mvc.perform(post("/api/ai/documents/1/generate").contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versionNumber").value(1))
                .andExpect(jsonPath("$.requiresReview").value(true));
    }

    @Test
    void generate_blankSourceCode_returns400() throws Exception {
        mvc.perform(post("/api/ai/documents/1/generate").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"filePath\":\"A.java\",\"sourceCode\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void templateNotFound_returns404() throws Exception {
        when(service.generate(eq(1L), any())).thenThrow(new NoSuchElementException("Template not found: 5"));

        mvc.perform(post("/api/ai/documents/1/generate").contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isNotFound());
    }

    @Test
    void invalidId_returns400() throws Exception {
        when(service.generate(eq(1L), any())).thenThrow(new IllegalArgumentException("bad id"));

        mvc.perform(post("/api/ai/documents/1/generate").contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aiEngineDown_returns503() throws Exception {
        when(service.generate(eq(1L), any())).thenThrow(
                new AiEngineException("Cannot reach AI Engine", HttpStatus.SERVICE_UNAVAILABLE, true));

        mvc.perform(post("/api/ai/documents/1/generate").contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void health_reflectsEngineState() throws Exception {
        when(service.aiEngineHealthy()).thenReturn(false);
        mvc.perform(get("/api/ai/health")).andExpect(status().isServiceUnavailable());

        when(service.aiEngineHealthy()).thenReturn(true);
        mvc.perform(get("/api/ai/health")).andExpect(status().isOk());
    }
}