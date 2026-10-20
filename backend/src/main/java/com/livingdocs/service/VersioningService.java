
package com.livingdocs.service;

import com.livingdocs.model.ChangeLog;
import com.livingdocs.model.DocumentVersion;
import com.livingdocs.payload.request.RollbackRequest;
import com.livingdocs.repository.ChangeLogRepository;
import com.livingdocs.repository.DocumentVersionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class VersioningService {

    private final DocumentVersionRepository versionRepository;
    private final ChangeLogRepository changeLogRepository;

    public VersioningService(
            DocumentVersionRepository versionRepository,
            ChangeLogRepository changeLogRepository) {
        this.versionRepository = versionRepository;
        this.changeLogRepository = changeLogRepository;
    }

    // Lấy lịch sử phiên bản, mới nhất trước
    @Transactional(readOnly = true)
    public List<DocumentVersion> getVersionHistory(Long documentId) {
        validateDocumentId(documentId);

        return versionRepository
                .findByDocumentIdOrderByVersionNumberDesc(documentId);
    }

    // Khôi phục nội dung từ phiên bản cũ bằng cách tạo phiên bản mới
    @Transactional
    public DocumentVersion rollbackToVersion(RollbackRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Rollback request cannot be null");
        }

        Long documentId = request.getDocumentId();
        Integer targetVersionNumber = request.getTargetVersion();
        String actorRole = request.getActorRole();

        validateDocumentId(documentId);

        if (targetVersionNumber == null || targetVersionNumber < 1) {
            throw new IllegalArgumentException(
                    "Target version must be a positive number");
        }

        if (actorRole == null || actorRole.isBlank()) {
            throw new IllegalArgumentException(
                    "Actor role cannot be empty");
        }

        DocumentVersion targetVersion = versionRepository
                .findByDocumentIdAndVersionNumber(
                        documentId, targetVersionNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Target version not found"));

        List<DocumentVersion> history =
                versionRepository
                        .findByDocumentIdOrderByVersionNumberDesc(
                                documentId);

        int latestVersionNumber = history.stream()
                .map(DocumentVersion::getVersionNumber)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);

        DocumentVersion newVersion = new DocumentVersion();
        newVersion.setDocumentId(documentId);
        newVersion.setContent(targetVersion.getContent());
        newVersion.setVersionNumber(latestVersionNumber + 1);
        newVersion.setCreatedByRole(actorRole);
        newVersion.setCreatedAt(LocalDateTime.now());

        DocumentVersion savedVersion =
                versionRepository.save(newVersion);

        ChangeLog log = new ChangeLog();
        log.setDocumentId(documentId);
        log.setAction("ROLLBACK");
        log.setActorRole(actorRole);
        log.setDescription(
                "Restored content from version "
                        + targetVersionNumber
                        + " as version "
                        + savedVersion.getVersionNumber());
        log.setTriggerSource("Manual Rollback");

        changeLogRepository.save(log);

        return savedVersion;
    }

    // Lấy nhật ký thay đổi
    @Transactional(readOnly = true)
    public List<ChangeLog> getChangeLogs(Long documentId) {
        validateDocumentId(documentId);

        return changeLogRepository
                .findByDocumentIdOrderByTimestampDesc(documentId);
    }

    private void validateDocumentId(Long documentId) {
        if (documentId == null || documentId <= 0) {
            throw new IllegalArgumentException(
                    "Document ID must be a positive number");
        }
    }
}
