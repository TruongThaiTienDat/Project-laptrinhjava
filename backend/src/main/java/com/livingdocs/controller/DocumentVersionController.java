package com.livingdocs.controller;

import com.livingdocs.model.ChangeLog;
import com.livingdocs.model.DocumentVersion;
import com.livingdocs.payload.request.RollbackRequest;
import com.livingdocs.service.VersioningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/documents")
public class DocumentVersionController {

    @Autowired
    private VersioningService versioningService;

    @GetMapping("/{documentId}/versions")
    public ResponseEntity<List<DocumentVersion>> getVersionHistory(@PathVariable Long documentId) {
        return ResponseEntity.ok(versioningService.getVersionHistory(documentId));
    }

    @PostMapping("/rollback")
    public ResponseEntity<DocumentVersion> rollbackVersion(@RequestBody RollbackRequest request) {
        return ResponseEntity.ok(versioningService.rollbackToVersion(request));
    }

    @GetMapping("/{documentId}/changelogs")
    public ResponseEntity<List<ChangeLog>> getChangeLogs(@PathVariable Long documentId) {
        return ResponseEntity.ok(versioningService.getChangeLogs(documentId));
    }
}