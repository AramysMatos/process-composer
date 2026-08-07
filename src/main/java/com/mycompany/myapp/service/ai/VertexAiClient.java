package com.mycompany.myapp.service.ai;

import com.mycompany.myapp.service.ai.dto.VertexGenerateResult;

/**
 * Abstraction over the Google Gen AI SDK (Vertex mode).
 */
public interface VertexAiClient {
    VertexGenerateResult generateContent(String prompt, int maxOutputTokens, String model);
}
