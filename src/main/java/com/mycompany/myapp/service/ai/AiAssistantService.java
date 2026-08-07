package com.mycompany.myapp.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.domain.AiUsageLog;
import com.mycompany.myapp.domain.enumeration.AiFeature;
import com.mycompany.myapp.repository.AiUsageLogRepository;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.InvalidOperationException;
import com.mycompany.myapp.service.ai.dto.AiCompletionResult;
import com.mycompany.myapp.service.ai.dto.VertexGenerateResult;
import com.mycompany.myapp.service.ai.exception.AiUnavailableException;
import java.time.Instant;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Central entry point for server-side AI completions.
 */
@Service
@Transactional
public class AiAssistantService {

    private static final String ENTITY_NAME = "ai";

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final FeatureFlagService featureFlagService;
    private final AiUsageLimitService aiUsageLimitService;
    private final VertexAiClient vertexAiClient;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final EntityAccessService entityAccessService;
    private final ApplicationProperties applicationProperties;
    private final ObjectMapper objectMapper;

    public AiAssistantService(
        FeatureFlagService featureFlagService,
        AiUsageLimitService aiUsageLimitService,
        VertexAiClient vertexAiClient,
        AiUsageLogRepository aiUsageLogRepository,
        EntityAccessService entityAccessService,
        ApplicationProperties applicationProperties,
        ObjectMapper objectMapper
    ) {
        this.featureFlagService = featureFlagService;
        this.aiUsageLimitService = aiUsageLimitService;
        this.vertexAiClient = vertexAiClient;
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.entityAccessService = entityAccessService;
        this.applicationProperties = applicationProperties;
        this.objectMapper = objectMapper;
    }

    public AiCompletionResult complete(String prompt, int maxOutputTokens, AiFeature feature) {
        validatePrompt(prompt);
        if (!featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)) {
            throw new AiUnavailableException("ai.disabled");
        }

        Long userId = entityAccessService.getCurrentUserId();
        aiUsageLimitService.assertWithinLimits(userId);

        int effectiveMaxTokens = Math.min(maxOutputTokens, applicationProperties.getAi().getLimits().getMaxOutputTokens());
        String model = applicationProperties.getAi().getVertex().getModel();

        VertexGenerateResult vertexResult = vertexAiClient.generateContent(prompt, effectiveMaxTokens, model);
        persistUsageLog(feature, vertexResult.getInputTokenCount(), vertexResult.getOutputTokenCount());

        return new AiCompletionResult(
            vertexResult.getText(),
            vertexResult.getInputTokenCount(),
            vertexResult.getOutputTokenCount(),
            feature
        );
    }

    public <T> T completeJson(String prompt, int maxOutputTokens, AiFeature feature, Class<T> type) {
        AiCompletionResult result = complete(prompt, maxOutputTokens, feature);
        try {
            return objectMapper.readValue(result.getText(), type);
        } catch (Exception ex) {
            log.warn("Failed to parse AI JSON response for feature {}", feature, ex);
            throw new AiUnavailableException("ai.invalid-response");
        }
    }

    private void validatePrompt(String prompt) {
        if (StringUtils.isBlank(prompt)) {
            throw new InvalidOperationException("Prompt is required", ENTITY_NAME, "promptRequired");
        }
        int maxInputChars = applicationProperties.getAi().getLimits().getMaxInputChars();
        if (prompt.length() > maxInputChars) {
            throw new InvalidOperationException("Prompt exceeds maximum length", ENTITY_NAME, "promptTooLong");
        }
    }

    private void persistUsageLog(AiFeature feature, int inputTokens, int outputTokens) {
        AiUsageLog usageLog = new AiUsageLog()
            .user(entityAccessService.getCurrentUser())
            .feature(feature)
            .inputTokens(inputTokens)
            .outputTokens(outputTokens)
            .createdAt(Instant.now());
        aiUsageLogRepository.save(usageLog);
    }
}
