package com.livingdocs.controller;

import com.livingdocs.payload.ai.AiDocumentResponse;
import com.livingdocs.payload.ai.GenerateDocRequest;
import com.livingdocs.payload.ai.UpdateDocRequest;
import com.livingdocs.service.AiInteropService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiInteropController {

    private final AiInteropService aiInteropService;

    public AiInteropController(AiInteropService aiInteropService) {
        this.aiInteropService = aiInteropService;
    }

    @PostMapping("/documents/{documentId}/generate")
    @PreAuthorize("hasAnyRole('DEVELOPER','TECH_LEAD','ADMIN')")
    public ResponseEntity<AiDocumentResponse> generate(@PathVariable Long documentId,
                                                       @Valid @RequestBody GenerateDocRequest request) {
        return ResponseEntity.ok(aiInteropService.generate(documentId, request));
    }

    @PostMapping("/documents/{documentId}/update")
    @PreAuthorize("hasAnyRole('DEVELOPER','TECH_LEAD','ADMIN')")
    public ResponseEntity<AiDocumentResponse> update(@PathVariable Long documentId,
                                                      @Valid @RequestBody UpdateDocRequest request) {
        return ResponseEntity.ok(aiInteropService.update(documentId, request));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean up = aiInteropService.aiEngineHealthy();
        return ResponseEntity.status(up ? 200 : 503)
                .body(Map.of("aiEngine", up ? "UP" : "DOWN"));
    }
}