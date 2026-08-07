package com.mycompany.myapp.service.ai;

import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.repository.AiUsageLogRepository;
import com.mycompany.myapp.service.FeatureFlagService;
import com.mycompany.myapp.service.ai.exception.AiQuotaExceededException;
import com.mycompany.myapp.service.ai.exception.AiUnavailableException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Enforces daily AI token quotas per user and globally.
 */
@Service
@Transactional(readOnly = true)
public class AiUsageLimitService {

    private final AiUsageLogRepository aiUsageLogRepository;
    private final FeatureFlagService featureFlagService;
    private final ApplicationProperties applicationProperties;

    public AiUsageLimitService(
        AiUsageLogRepository aiUsageLogRepository,
        FeatureFlagService featureFlagService,
        ApplicationProperties applicationProperties
    ) {
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.featureFlagService = featureFlagService;
        this.applicationProperties = applicationProperties;
    }

    public void assertWithinLimits(Long userId) {
        if (!featureFlagService.isEnabled(PlatformSettingKeys.AI_ENABLED)) {
            throw new AiUnavailableException("ai.disabled");
        }
        ApplicationProperties.Ai.Limits limits = applicationProperties.getAi().getLimits();
        Instant startOfDay = startOfDay();
        long userTotal = aiUsageLogRepository.sumTokensByUserSince(userId, startOfDay);
        if (userTotal >= limits.getDailyTokensPerUser()) {
            throw new AiQuotaExceededException("ai.quota.user");
        }
        long globalTotal = aiUsageLogRepository.sumTokensGlobalSince(startOfDay);
        if (globalTotal >= limits.getDailyTokensGlobal()) {
            throw new AiQuotaExceededException("ai.quota.global");
        }
    }

    private Instant startOfDay() {
        ZoneId zone = ZoneId.systemDefault();
        return LocalDate.now(zone).atStartOfDay(zone).toInstant();
    }
}
