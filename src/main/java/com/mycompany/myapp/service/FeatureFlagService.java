package com.mycompany.myapp.service;

import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.config.PlatformSettingRegistry;
import com.mycompany.myapp.domain.User;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Feature flags backed by {@link PlatformSettingService} boolean values.
 */
@Service
@Transactional(readOnly = true)
public class FeatureFlagService {

    private final PlatformSettingService platformSettingService;
    private final PlatformSettingRegistry platformSettingRegistry;

    public FeatureFlagService(PlatformSettingService platformSettingService, PlatformSettingRegistry platformSettingRegistry) {
        this.platformSettingService = platformSettingService;
        this.platformSettingRegistry = platformSettingRegistry;
    }

    public boolean isEnabled(String flagKey) {
        return platformSettingService.getValue(flagKey).map(this::parseBoolean).orElse(false);
    }

    public boolean isAiEnabled() {
        return isEnabled(PlatformSettingKeys.AI_ENABLED);
    }

    @Transactional
    public void setEnabled(String flagKey, boolean enabled, User updatedBy) {
        platformSettingService.setValue(flagKey, Boolean.toString(enabled), updatedBy);
    }

    public Map<String, Boolean> getPublicFlags() {
        Map<String, Boolean> flags = new LinkedHashMap<>();
        platformSettingRegistry.getPubliclyReadable().forEach(definition -> flags.put(definition.key(), isEnabled(definition.key())));
        return flags;
    }

    private boolean parseBoolean(String value) {
        return "true".equalsIgnoreCase(value != null ? value.trim() : "");
    }
}
