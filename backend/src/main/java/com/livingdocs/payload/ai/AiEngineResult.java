package com.livingdocs.payload.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiEngineResult(
        @JsonProperty("content") String content,
        @JsonProperty("confidence_score") Double confidenceScore,
        @JsonProperty("grounding_evidence") List<GroundingEvidence> groundingEvidence,
        @JsonProperty("model") String model) {
}