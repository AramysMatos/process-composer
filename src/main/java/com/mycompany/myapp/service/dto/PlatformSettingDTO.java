package com.mycompany.myapp.service.dto;

import com.mycompany.myapp.domain.enumeration.SettingType;
import java.time.Instant;

/**
 * DTO for platform setting admin and public APIs.
 */
public class PlatformSettingDTO {

    private String key;
    private String value;
    private SettingType type;
    private String labelKey;
    private String descriptionKey;
    private boolean publiclyReadable;
    private Instant updatedAt;
    private String updatedByLogin;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public SettingType getType() {
        return type;
    }

    public void setType(SettingType type) {
        this.type = type;
    }

    public String getLabelKey() {
        return labelKey;
    }

    public void setLabelKey(String labelKey) {
        this.labelKey = labelKey;
    }

    public String getDescriptionKey() {
        return descriptionKey;
    }

    public void setDescriptionKey(String descriptionKey) {
        this.descriptionKey = descriptionKey;
    }

    public boolean isPubliclyReadable() {
        return publiclyReadable;
    }

    public void setPubliclyReadable(boolean publiclyReadable) {
        this.publiclyReadable = publiclyReadable;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedByLogin() {
        return updatedByLogin;
    }

    public void setUpdatedByLogin(String updatedByLogin) {
        this.updatedByLogin = updatedByLogin;
    }
}
