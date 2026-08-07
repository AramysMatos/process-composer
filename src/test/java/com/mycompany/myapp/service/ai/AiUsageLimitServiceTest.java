package com.mycompany.myapp.service.ai;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.repository.AiUsageLogRepository;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.ai.exception.AiQuotaExceededException;
import com.mycompany.myapp.service.ai.exception.AiUnavailableException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiUsageLimitServiceTest {

    @Mock
    private AiUsageLogRepository aiUsageLogRepository;

    @Mock
    private FeatureFlagService featureFlagService;

    private ApplicationProperties applicationProperties;
    private AiUsageLimitService aiUsageLimitService;

    @BeforeEach
    void setUp() {
        applicationProperties = new ApplicationProperties();
        applicationProperties.getAi().getLimits().setDailyTokensPerUser(100);
        applicationProperties.getAi().getLimits().setDailyTokensGlobal(500);
        aiUsageLimitService = new AiUsageLimitService(aiUsageLogRepository, featureFlagService, applicationProperties);
    }

    @Test
    void assertWithinLimits_whenAiDisabled_throwsUnavailable() {
        when(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).thenReturn(false);

        assertThatThrownBy(() -> aiUsageLimitService.assertWithinLimits(1L))
            .isInstanceOf(AiUnavailableException.class)
            .hasFieldOrPropertyWithValue("errorKey", "ai.disabled");
    }

    @Test
    void assertWithinLimits_whenUserQuotaExceeded_throwsQuotaExceeded() {
        Instant startOfDay = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        when(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).thenReturn(true);
        when(aiUsageLogRepository.sumTokensByUserSince(1L, startOfDay)).thenReturn(100L);

        assertThatThrownBy(() -> aiUsageLimitService.assertWithinLimits(1L))
            .isInstanceOf(AiQuotaExceededException.class)
            .hasFieldOrPropertyWithValue("errorKey", "ai.quota.user");
    }

    @Test
    void assertWithinLimits_whenGlobalQuotaExceeded_throwsQuotaExceeded() {
        Instant startOfDay = LocalDate.now(ZoneId.systemDefault()).atStartOfDay(ZoneId.systemDefault()).toInstant();
        when(featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)).thenReturn(true);
        when(aiUsageLogRepository.sumTokensByUserSince(1L, startOfDay)).thenReturn(10L);
        when(aiUsageLogRepository.sumTokensGlobalSince(startOfDay)).thenReturn(500L);

        assertThatThrownBy(() -> aiUsageLimitService.assertWithinLimits(1L))
            .isInstanceOf(AiQuotaExceededException.class)
            .hasFieldOrPropertyWithValue("errorKey", "ai.quota.global");
    }
}
