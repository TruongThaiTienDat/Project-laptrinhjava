package com.livingdocs.payload.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GroundingEvidence(
        @JsonProperty("file_path") String filePath,
        @JsonProperty("code_entity") String codeEntity,
        @JsonProperty("commit_hash") String commitHash) {
}