package com.mycompany.myapp.service.ai.dto;

/**
 * Result returned by {@link com.mycompany.myapp.service.ai.VertexAiClient}.
 */
public class VertexGenerateResult {

    private final String text;
    private final int inputTokenCount;
    private final int outputTokenCount;

    public VertexGenerateResult(String text, int inputTokenCount, int outputTokenCount) {
        this.text = text;
        this.inputTokenCount = inputTokenCount;
        this.outputTokenCount = outputTokenCount;
    }

    public String getText() {
        return text;
    }

    public int getInputTokenCount() {
        return inputTokenCount;
    }

    public int getOutputTokenCount() {
        return outputTokenCount;
    }
}
