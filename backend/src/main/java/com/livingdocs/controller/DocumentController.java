
package com.livingdocs.controller;

import com.livingdocs.model.Document;
import com.livingdocs.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;

    public DocumentController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @PostMapping
    public ResponseEntity<Document> createDocument(
            @RequestBody Document document) {

        if (document.getTitle() == null
                || document.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        document.setId(null);
        Document savedDocument = documentRepository.save(document);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDocument);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<Document> getDocument(
            @PathVariable Long documentId) {

        return documentRepository.findById(documentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
