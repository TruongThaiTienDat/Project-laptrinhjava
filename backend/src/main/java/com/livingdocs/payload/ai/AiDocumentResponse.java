package com.livingdocs.payload.ai;

import java.util.List;

public record AiDocumentResponse(
        Long documentId,
        Integer versionNumber,
        String content,
        Double confidenceScore,
        List<GroundingEvidence> groundingEvidence,
        boolean requiresReview) {
}