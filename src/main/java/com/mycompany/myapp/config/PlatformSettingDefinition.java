package com.mycompany.myapp.config;

import com.mycompany.myapp.domain.enumeration.SettingType;

/**
 * Metadata for known platform settings (UI labels, validation, public readability).
 */
public class PlatformSettingDefinition {

    private final String key;
    private final SettingType type;
    private final String labelKey;
    private final String descriptionKey;
    private final boolean publiclyReadable;

    public PlatformSettingDefinition(String key, SettingType type, String labelKey, String descriptionKey, boolean publiclyReadable) {
        this.key = key;
        this.type = type;
        this.labelKey = labelKey;
        this.descriptionKey = descriptionKey;
        this.publiclyReadable = publiclyReadable;
    }

    public String key() {
        return key;
    }

    public SettingType type() {
        return type;
    }

    public String labelKey() {
        return labelKey;
    }

    public String descriptionKey() {
        return descriptionKey;
    }

    public boolean publiclyReadable() {
        return publiclyReadable;
    }
}
