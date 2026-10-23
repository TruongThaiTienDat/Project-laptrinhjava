package com.livingdocs.payload.ai;

import jakarta.validation.constraints.NotBlank;

public record UpdateDocRequest(
        @NotBlank String filePath,
        String language,
        @NotBlank String codeDiff,
        String commitHash) {
}