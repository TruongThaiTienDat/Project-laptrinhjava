package com.livingdocs.payload.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiGenerateRequest(
        @JsonProperty("document_id") Long documentId,
        @JsonProperty("file_path") String filePath,
        @JsonProperty("language") String language,
        @JsonProperty("source_code") String sourceCode,
        @JsonProperty("template_structure") String templateStructure,
        @JsonProperty("commit_hash") String commitHash) {
}