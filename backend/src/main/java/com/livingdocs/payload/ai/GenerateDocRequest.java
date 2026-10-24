package com.livingdocs.payload.ai;

import jakarta.validation.constraints.NotBlank;

public record GenerateDocRequest(
        Long templateId,
        @NotBlank String filePath,
        String language,
        @NotBlank String sourceCode,
        String commitHash) {
}