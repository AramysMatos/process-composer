package com.mycompany.myapp.service.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.domain.AiUsageLog;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.domain.enumeration.AiFeature;
import com.mycompany.myapp.repository.AiUsageLogRepository;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.ai.dto.AiCompletionResult;
import com.mycompany.myapp.service.ai.dto.VertexGenerateResult;
import com.mycompany.myapp.service.ai.exception.AiUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiAssistantServiceTest {

    @Mock
    private FeatureFlagService featureFlagService;

    @Mock
    private AiUsageLimitService aiUsageLimitService;

    @Mock
    private VertexAiClient vertexAiClient;

    @Mock
    private AiUsageLogRepository aiUsageLogRepository;

    @Mock
    private EntityAccessService entityAccessService;

    private ApplicationProperties applicationProperties;
    private AiAssistantService aiAssistantService;

    @BeforeEach
    void setUp() {
        applicationProperties = new ApplicationProperties();
        applicationProperties.getAi().getVertex().setModel("gemini-2.5-flash-lite");
        applicationProperties.getAi().getLimits().setMaxOutputTokens(2048);
        applicationProperties.getAi().getLimits().setMaxInputChars(4000);

        aiAssistantService =
            new AiAssistantService(
                featureFlagService,
                aiUsageLimitService,
                vertexAiClient,
                aiUsageLogRepository,
                entityAccessService,
                applicationProperties,
                new ObjectMapper()
            );
    }

    @Test
    void complete_whenAiDisabled_throwsUnavailable() {
        when(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).thenReturn(false);

        assertThatThrownBy(() -> aiAssistantService.complete("hello", 100, AiFeature.SMOKE_TEST))
            .isInstanceOf(AiUnavailableException.class)
            .hasFieldOrPropertyWithValue("errorKey", "ai.disabled");

        verify(vertexAiClient, never()).generateContent(anyString(), anyInt(), anyString());
    }

    @Test
    void complete_whenEnabled_persistsUsageLogAndReturnsResult() {
        User user = new User();
        user.setId(42L);
        when(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).thenReturn(true);
        when(entityAccessService.getCurrentUserId()).thenReturn(42L);
        when(entityAccessService.getCurrentUser()).thenReturn(user);
        when(vertexAiClient.generateContent("hello", 100, "gemini-2.5-flash-lite")).thenReturn(new VertexGenerateResult("OK", 12, 1));

        AiCompletionResult result = aiAssistantService.complete("hello", 100, AiFeature.SMOKE_TEST);

        assertThat(result.getText()).isEqualTo("OK");
        assertThat(result.getInputTokens()).isEqualTo(12);
        assertThat(result.getOutputTokens()).isEqualTo(1);
        assertThat(result.getFeature()).isEqualTo(AiFeature.SMOKE_TEST);

        ArgumentCaptor<AiUsageLog> captor = ArgumentCaptor.forClass(AiUsageLog.class);
        verify(aiUsageLogRepository).save(captor.capture());
        AiUsageLog saved = captor.getValue();
        assertThat(saved.getUser()).isEqualTo(user);
        assertThat(saved.getFeature()).isEqualTo(AiFeature.SMOKE_TEST);
        assertThat(saved.getInputTokens()).isEqualTo(12);
        assertThat(saved.getOutputTokens()).isEqualTo(1);
        assertThat(saved.getCreatedAt()).isNotNull();
    }
}
