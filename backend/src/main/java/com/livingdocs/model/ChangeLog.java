package com.livingdocs.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "change_logs")
public class ChangeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String actorRole;

    private String description;

    private String triggerSource;

    private LocalDateTime timestamp = LocalDateTime.now();

    public ChangeLog() {
    }

    public ChangeLog(Long id, Long documentId, String action, String actorRole, String description, String triggerSource, LocalDateTime timestamp) {
        this.id = id;
        this.documentId = documentId;
        this.action = action;
        this.actorRole = actorRole;
        this.description = description;
        this.triggerSource = triggerSource;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTriggerSource() {
        return triggerSource;
    }

    public void setTriggerSource(String triggerSource) {
        this.triggerSource = triggerSource;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}