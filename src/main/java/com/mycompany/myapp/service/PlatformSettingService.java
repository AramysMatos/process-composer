package com.mycompany.myapp.service;

import com.mycompany.myapp.config.ApplicationProperties;
import com.mycompany.myapp.config.PlatformSettingKeys;
import com.mycompany.myapp.config.PlatformSettingRegistry;
import com.mycompany.myapp.domain.PlatformSetting;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.PlatformSettingRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages runtime platform settings stored as key-value pairs.
 */
@Service
@Transactional
public class PlatformSettingService {

    public static final String PLATFORM_SETTING_CACHE = "platformSettingByKey";

    private static final Logger log = LoggerFactory.getLogger(PlatformSettingService.class);

    private final PlatformSettingRepository platformSettingRepository;
    private final PlatformSettingRegistry platformSettingRegistry;
    private final ApplicationProperties applicationProperties;

    public PlatformSettingService(
        PlatformSettingRepository platformSettingRepository,
        PlatformSettingRegistry platformSettingRegistry,
        ApplicationProperties applicationProperties
    ) {
        this.platformSettingRepository = platformSettingRepository;
        this.platformSettingRegistry = platformSettingRegistry;
        this.applicationProperties = applicationProperties;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = PLATFORM_SETTING_CACHE, key = "#key")
    public Optional<String> getValue(String key) {
        return platformSettingRepository.findById(key).map(PlatformSetting::getSettingValue);
    }

    @CacheEvict(cacheNames = PLATFORM_SETTING_CACHE, key = "#key")
    public void setValue(String key, String value, User updatedBy) {
        PlatformSetting setting = platformSettingRepository
            .findById(key)
            .orElseGet(() -> new PlatformSetting().settingKey(key).settingValue(value));

        setting.setSettingValue(value);
        setting.setUpdatedAt(Instant.now());
        setting.setUpdatedBy(updatedBy);
        platformSettingRepository.save(setting);
        log.debug("Updated platform setting {} to {}", key, value);
    }

    @Transactional(readOnly = true)
    public Optional<PlatformSetting> findByKey(String key) {
        return platformSettingRepository.findById(key);
    }

    @Transactional(readOnly = true)
    public List<PlatformSetting> findAllEntities() {
        return platformSettingRepository.findAll();
    }

    public void ensureDefaults() {
        Map<String, String> yamlDefaults = applicationProperties.getPlatformSettings().getDefaults();
        platformSettingRegistry
            .getAll()
            .forEach(definition -> {
                String defaultValue = yamlDefaults.getOrDefault(definition.key(), getRegistryDefault(definition.key()));
                ensureDefault(definition.key(), defaultValue);
            });
    }

    public void ensureDefault(String key, String defaultValue) {
        if (!platformSettingRepository.existsById(key)) {
            PlatformSetting setting = new PlatformSetting().settingKey(key).settingValue(defaultValue).updatedAt(Instant.now());
            platformSettingRepository.save(setting);
            log.info("Seeded platform setting {} with default value {}", key, defaultValue);
        }
    }

    private String getRegistryDefault(String key) {
        if (PlatformSettingKeys.AI_ENABLED.equals(key)) {
            return "false";
        }
        return "";
    }
}
