package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Runtime platform configuration stored as key-value pairs.
 */
@Entity
@Table(name = "platform_setting")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PlatformSetting implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @NotNull
    @Size(max = 100)
    @Column(name = "setting_key", length = 100, nullable = false)
    private String settingKey;

    @NotNull
    @Size(max = 1000)
    @Column(name = "setting_value", length = 1000, nullable = false)
    private String settingValue;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id")
    @JsonIgnoreProperties(value = { "authorities", "password", "activationKey", "resetKey", "resetDate", "langKey" })
    private User updatedBy;

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public PlatformSetting settingKey(String settingKey) {
        this.setSettingKey(settingKey);
        return this;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public PlatformSetting settingValue(String settingValue) {
        this.setSettingValue(settingValue);
        return this;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public PlatformSetting updatedAt(Instant updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public PlatformSetting updatedBy(User updatedBy) {
        this.setUpdatedBy(updatedBy);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PlatformSetting)) {
            return false;
        }
        return settingKey != null && settingKey.equals(((PlatformSetting) o).settingKey);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "PlatformSetting{" + "settingKey='" + getSettingKey() + "'" + ", settingValue='" + getSettingValue() + "'" + "}";
    }
}
