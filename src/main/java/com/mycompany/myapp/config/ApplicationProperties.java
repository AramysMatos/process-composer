package com.mycompany.myapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Process Composer.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final GitHub github = new GitHub();
    private final PlatformSettings platformSettings = new PlatformSettings();

    public GitHub getGithub() {
        return github;
    }

    public PlatformSettings getPlatformSettings() {
        return platformSettings;
    }

    public static class PlatformSettings {

        private java.util.Map<String, String> defaults = new java.util.HashMap<>();

        public java.util.Map<String, String> getDefaults() {
            return defaults;
        }

        public void setDefaults(java.util.Map<String, String> defaults) {
            this.defaults = defaults;
        }
    }

    public static class GitHub {

        private String tokenEncryptionKey;

        public String getTokenEncryptionKey() {
            return tokenEncryptionKey;
        }

        public void setTokenEncryptionKey(String tokenEncryptionKey) {
            this.tokenEncryptionKey = tokenEncryptionKey;
        }
    }
    // jhipster-needle-application-properties-property
    // jhipster-needle-application-properties-property-getter
    // jhipster-needle-application-properties-property-class
}
