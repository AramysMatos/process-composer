package com.mycompany.myapp.config;

import com.mycompany.myapp.domain.enumeration.SettingType;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Registry of platform settings known to the application.
 */
@Component
public class PlatformSettingRegistry {

    private static final List<PlatformSettingDefinition> DEFINITIONS = Collections.unmodifiableList(
        Arrays.asList(
            new PlatformSettingDefinition(
                PlatformSettingKeys.AI_ENABLED,
                SettingType.BOOLEAN,
                "platformSettings.flags.ai.enabled",
                "platformSettings.flags.ai.enabledHelp",
                true
            )
        )
    );

    public List<PlatformSettingDefinition> getAll() {
        return DEFINITIONS;
    }

    public Optional<PlatformSettingDefinition> findByKey(String key) {
        return DEFINITIONS.stream().filter(definition -> definition.key().equals(key)).findFirst();
    }

    public List<PlatformSettingDefinition> getBooleanFlags() {
        return DEFINITIONS.stream().filter(definition -> definition.type() == SettingType.BOOLEAN).collect(Collectors.toList());
    }

    public List<PlatformSettingDefinition> getNonBooleanSettings() {
        return DEFINITIONS.stream().filter(definition -> definition.type() != SettingType.BOOLEAN).collect(Collectors.toList());
    }

    public List<PlatformSettingDefinition> getPubliclyReadable() {
        return DEFINITIONS.stream().filter(PlatformSettingDefinition::publiclyReadable).collect(Collectors.toList());
    }
}
