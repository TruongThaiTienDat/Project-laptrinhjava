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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiInteropServiceTest {

    @Mock AiEngineClientService aiClient;
    @Mock DocumentRepository documentRepository;
    @Mock TemplateRepository templateRepository;
    @Mock DocumentVersionRepository versionRepository;
    @Mock ChangeLogRepository changeLogRepository;
    @Mock TransactionTemplate tx;

    AiInteropService service;

    @BeforeEach
    void setUp() {
        service = new AiInteropService(aiClient, documentRepository, templateRepository,
                versionRepository, changeLogRepository, tx);
        lenient().when(tx.execute(any())).thenAnswer(inv ->
                ((TransactionCallback<?>) inv.getArgument(0)).doInTransaction(null));
        lenient().when(versionRepository.save(any(DocumentVersion.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    private Document doc() {
        Document d = new Document();
        d.setId(1L);
        d.setContent("old content");
        return d;
    }

    private AiEngineResult result() {
        return new AiEngineResult("# New doc", 0.8,
                List.of(new GroundingEvidence("A.java", "A", "abc")), "m");
    }

    @Test
    void generate_createsNextVersionAndChangeLog() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        DocumentVersion v2 = new DocumentVersion();
        v2.setVersionNumber(2);
        when(versionRepository.findByDocumentIdOrderByVersionNumberDesc(1L)).thenReturn(List.of(v2));
        when(aiClient.generateDocumentation(any())).thenReturn(result());

        AiDocumentResponse r = service.generate(1L,
                new GenerateDocRequest(null, "A.java", "java", "class A {}", "abc"));

        assertEquals(3, r.versionNumber());
        assertEquals("# New doc", r.content());
        assertTrue(r.requiresReview());
        assertEquals(1, r.groundingEvidence().size());

        ArgumentCaptor<DocumentVersion> vc = ArgumentCaptor.forClass(DocumentVersion.class);
        verify(versionRepository).save(vc.capture());
        assertEquals("AI", vc.getValue().getCreatedByRole());

        ArgumentCaptor<ChangeLog> cc = ArgumentCaptor.forClass(ChangeLog.class);
        verify(changeLogRepository).save(cc.capture());
        assertEquals("AI_GENERATE", cc.getValue().getAction());
        assertEquals("AI", cc.getValue().getActorRole());
        assertEquals("Commit abc", cc.getValue().getTriggerSource());
    }

    @Test
    void generate_firstVersionIsOne_andManualTriggerWhenNoCommit() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        when(versionRepository.findByDocumentIdOrderByVersionNumberDesc(1L)).thenReturn(List.of());
        when(aiClient.generateDocumentation(any())).thenReturn(result());

        AiDocumentResponse r = service.generate(1L,
                new GenerateDocRequest(null, "A.java", "java", "class A {}", null));

        assertEquals(1, r.versionNumber());
        ArgumentCaptor<ChangeLog> cc = ArgumentCaptor.forClass(ChangeLog.class);
        verify(changeLogRepository).save(cc.capture());
        assertEquals("Manual Request", cc.getValue().getTriggerSource());
    }

    @Test
    void generate_passesTemplateStructureToAiEngine() {
        Template t = new Template();
        t.setContentStructure("## Overview");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        when(templateRepository.findById(5L)).thenReturn(Optional.of(t));
        when(versionRepository.findByDocumentIdOrderByVersionNumberDesc(1L)).thenReturn(List.of());
        when(aiClient.generateDocumentation(any())).thenReturn(result());

        service.generate(1L, new GenerateDocRequest(5L, "A.java", "java", "class A {}", null));

        ArgumentCaptor<AiGenerateRequest> rc = ArgumentCaptor.forClass(AiGenerateRequest.class);
        verify(aiClient).generateDocumentation(rc.capture());
        assertEquals("## Overview", rc.getValue().templateStructure());
    }

    @Test
    void update_sendsCurrentContentAndDiff() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        when(versionRepository.findByDocumentIdOrderByVersionNumberDesc(1L)).thenReturn(List.of());
        when(aiClient.updateDocumentation(any())).thenReturn(result());

        service.update(1L, new UpdateDocRequest("A.java", "java", "+x", "abc"));

        ArgumentCaptor<AiUpdateRequest> rc = ArgumentCaptor.forClass(AiUpdateRequest.class);
        verify(aiClient).updateDocumentation(rc.capture());
        assertEquals("old content", rc.getValue().currentContent());
        assertEquals("+x", rc.getValue().codeDiff());
    }

    @Test
    void documentNotFound_throws404_andDoesNotCallAi() {
        when(documentRepository.findById(9L)).thenReturn(Optional.empty());

        AiEngineException ex = assertThrows(AiEngineException.class, () -> service.generate(9L,
                new GenerateDocRequest(null, "A.java", "java", "class A {}", null)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        verifyNoInteractions(aiClient);
    }

    @Test
    void templateNotFound_throwsNoSuchElement() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        when(templateRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(java.util.NoSuchElementException.class, () -> service.generate(1L,
                new GenerateDocRequest(5L, "A.java", "java", "class A {}", null)));
    }

    @Test
    void invalidDocumentId_throwsIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () -> service.generate(0L,
                new GenerateDocRequest(null, "A.java", "java", "class A {}", null)));
    }

    @Test
    void aiFailure_savesNothing() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(doc()));
        when(aiClient.generateDocumentation(any())).thenThrow(
                new AiEngineException("down", HttpStatus.SERVICE_UNAVAILABLE, true));

        assertThrows(AiEngineException.class, () -> service.generate(1L,
                new GenerateDocRequest(null, "A.java", "java", "class A {}", null)));

        verifyNoInteractions(versionRepository, changeLogRepository);
    }
}