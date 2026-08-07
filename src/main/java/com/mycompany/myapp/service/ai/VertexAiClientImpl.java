package com.mycompany.myapp.service.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.GenerateContentResponseUsageMetadata;
import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.ai.dto.VertexGenerateResult;
import com.mycompany.myapp.service.ai.exception.AiUnavailableException;
import javax.annotation.PreDestroy;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Vertex AI client using Google Gen AI SDK with Application Default Credentials.
 */
@Service
public class VertexAiClientImpl implements VertexAiClient {

    private static final Logger log = LoggerFactory.getLogger(VertexAiClientImpl.class);

    private final ApplicationProperties applicationProperties;
    private final FeatureFlagService featureFlagService;
    private volatile Client client;

    public VertexAiClientImpl(ApplicationProperties applicationProperties, FeatureFlagService featureFlagService) {
        this.applicationProperties = applicationProperties;
        this.featureFlagService = featureFlagService;
    }

    @Override
    public VertexGenerateResult generateContent(String prompt, int maxOutputTokens, String model) {
        Client activeClient = getOrCreateClient();
        GenerateContentConfig config = GenerateContentConfig.builder().maxOutputTokens(maxOutputTokens).build();
        try {
            GenerateContentResponse response = activeClient.models.generateContent(model, prompt, config);
            String text = response.text();
            int inputTokens = 0;
            int outputTokens = 0;
            if (response.usageMetadata().isPresent()) {
                GenerateContentResponseUsageMetadata usage = response.usageMetadata().get();
                inputTokens = usage.promptTokenCount().orElse(0);
                outputTokens = usage.candidatesTokenCount().orElse(0);
            }
            if (inputTokens == 0 && outputTokens == 0) {
                log.warn("Token counts not returned by Vertex API; estimating from prompt/response length");
                inputTokens = prompt.length() / 4;
                outputTokens = text != null ? text.length() / 4 : 0;
            }
            return new VertexGenerateResult(text, inputTokens, outputTokens);
        } catch (AiUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AiUnavailableException("ai.unavailable", ex);
        }
    }

    private Client getOrCreateClient() {
        if (!featureFlagService.isAiEnabled()) {
            throw new AiUnavailableException("ai.disabled");
        }
        String projectId = applicationProperties.getAi().getVertex().getProjectId();
        if (StringUtils.isBlank(projectId)) {
            throw new AiUnavailableException("ai.vertex.not-configured");
        }
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    client =
                        Client
                            .builder()
                            .vertexAI(true)
                            .project(projectId)
                            .location(applicationProperties.getAi().getVertex().getLocation())
                            .build();
                }
            }
        }
        return client;
    }

    @PreDestroy
    public void close() {
        if (client != null) {
            client.close();
        }
    }
}
