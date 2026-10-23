package com.livingdocs.service;

import com.livingdocs.exception.AiEngineException;
import com.livingdocs.model.ChangeLog;
import com.livingdocs.model.Document;
import com.livingdocs.model.DocumentVersion;
import com.livingdocs.model.Template;
import com.livingdocs.payload.ai.*;
import com.livingdocs.repository.ChangeLogRepository;
import com.livingdocs.repository.DocumentRepository;
import com.livingdocs.repository.DocumentVersionRepository;
import com.livingdocs.repository.TemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
public class AiInteropService {

    public static final String AI_ROLE = "AI";

    private final AiEngineClientService aiClient;
    private final DocumentRepository documentRepository;
    private final TemplateRepository templateRepository;
    private final DocumentVersionRepository versionRepository;
    private final ChangeLogRepository changeLogRepository;
    private final TransactionTemplate tx;

    public AiInteropService(AiEngineClientService aiClient,
                            DocumentRepository documentRepository,
                            TemplateRepository templateRepository,
                            DocumentVersionRepository versionRepository,
                            ChangeLogRepository changeLogRepository,
                            TransactionTemplate tx) {
        this.aiClient = aiClient;
        this.documentRepository = documentRepository;
        this.templateRepository = templateRepository;
        this.versionRepository = versionRepository;
        this.changeLogRepository = changeLogRepository;
        this.tx = tx;
    }

    public AiDocumentResponse generate(Long documentId, GenerateDocRequest req) {
        Document doc = findDocument(documentId);

        String templateStructure = null;
        if (req.templateId() != null) {
            Template template = templateRepository.findById(req.templateId())
                    .orElseThrow(() -> new NoSuchElementException(
                            "Template not found: " + req.templateId()));
            templateStructure = template.getContentStructure();
        }

        AiEngineResult result = aiClient.generateDocumentation(new AiGenerateRequest(
                doc.getId(), req.filePath(), req.language(), req.sourceCode(),
                templateStructure, req.commitHash()));

        return saveAiVersion(doc.getId(), result, "AI_GENERATE", req.commitHash(),
                "AI generated documentation from " + req.filePath());
    }

    public AiDocumentResponse update(Long documentId, UpdateDocRequest req) {
        Document doc = findDocument(documentId);

        AiEngineResult result = aiClient.updateDocumentation(new AiUpdateRequest(
                doc.getId(), req.filePath(), req.language(), doc.getContent(),
                req.codeDiff(), req.commitHash()));

        return saveAiVersion(doc.getId(), result, "AI_UPDATE", req.commitHash(),
                "AI updated documentation after code change in " + req.filePath());
    }

    public boolean aiEngineHealthy() {
        return aiClient.isHealthy();
    }

    private AiDocumentResponse saveAiVersion(Long documentId, AiEngineResult result,
                                             String action, String commitHash, String description) {
        return tx.execute(status -> {
            int latest = versionRepository
                    .findByDocumentIdOrderByVersionNumberDesc(documentId).stream()
                    .map(DocumentVersion::getVersionNumber)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max().orElse(0);

            DocumentVersion version = new DocumentVersion();
            version.setDocumentId(documentId);
            version.setContent(result.content());
            version.setVersionNumber(latest + 1);
            version.setCreatedByRole(AI_ROLE);
            version.setCreatedAt(LocalDateTime.now());
            DocumentVersion saved = versionRepository.save(version);

            ChangeLog log = new ChangeLog();
            log.setDocumentId(documentId);
            log.setAction(action);
            log.setActorRole(AI_ROLE);
            log.setDescription(description + String.format(" (confidence=%.2f, version=%d)",
                    result.confidenceScore(), saved.getVersionNumber()));
            log.setTriggerSource(commitHash != null && !commitHash.isBlank()
                    ? "Commit " + commitHash : "Manual Request");
            changeLogRepository.save(log);

            List<GroundingEvidence> evidence = result.groundingEvidence() == null
                    ? List.of() : result.groundingEvidence();

            return new AiDocumentResponse(documentId, saved.getVersionNumber(),
                    saved.getContent(), result.confidenceScore(), evidence, true);
        });
    }

    private Document findDocument(Long documentId) {
        if (documentId == null || documentId <= 0) {
            throw new IllegalArgumentException("Document ID must be a positive number");
        }
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new AiEngineException(
                        "Document not found: " + documentId, HttpStatus.NOT_FOUND, false));
    }
}