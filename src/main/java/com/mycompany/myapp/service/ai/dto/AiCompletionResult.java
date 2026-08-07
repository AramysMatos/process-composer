package com.mycompany.myapp.service.ai.dto;

import com.mycompany.myapp.domain.enumeration.AiFeature;

/**
 * Result of an AI completion request.
 */
public class AiCompletionResult {

    private String text;
    private int inputTokens;
    private int outputTokens;
    private AiFeature feature;

    public AiCompletionResult() {}

    public AiCompletionResult(String text, int inputTokens, int outputTokens, AiFeature feature) {
        this.text = text;
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
        this.feature = feature;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getInputTokens() {
        return inputTokens;
    }

    public void setInputTokens(int inputTokens) {
        this.inputTokens = inputTokens;
    }

    public int getOutputTokens() {
        return outputTokens;
    }

    public void setOutputTokens(int outputTokens) {
        this.outputTokens = outputTokens;
    }

    public AiFeature getFeature() {
        return feature;
    }

    public void setFeature(AiFeature feature) {
        this.feature = feature;
    }
}
