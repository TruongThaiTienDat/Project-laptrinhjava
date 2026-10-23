package com.livingdocs.payload.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiUpdateRequest(
        @JsonProperty("document_id") Long documentId,
        @JsonProperty("file_path") String filePath,
        @JsonProperty("language") String language,
        @JsonProperty("current_content") String currentContent,
        @JsonProperty("code_diff") String codeDiff,
        @JsonProperty("commit_hash") String commitHash) {
}