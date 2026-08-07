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
    private final Ai ai = new Ai();

    public GitHub getGithub() {
        return github;
    }

    public PlatformSettings getPlatformSettings() {
        return platformSettings;
    }

    public Ai getAi() {
        return ai;
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

    public static class Ai {

        private final Vertex vertex = new Vertex();
        private final Limits limits = new Limits();

        public Vertex getVertex() {
            return vertex;
        }

        public Limits getLimits() {
            return limits;
        }

        public static class Vertex {

            private String projectId;
            private String location = "us-central1";
            private String model = "gemini-2.5-flash-lite";

            public String getProjectId() {
                return projectId;
            }

            public void setProjectId(String projectId) {
                this.projectId = projectId;
            }

            public String getLocation() {
                return location;
            }

            public void setLocation(String location) {
                this.location = location;
            }

            public String getModel() {
                return model;
            }

            public void setModel(String model) {
                this.model = model;
            }
        }

        public static class Limits {

            private int maxInputChars = 4000;
            private int maxOutputTokens = 2048;
            private int dailyTokensPerUser = 20000;
            private int dailyTokensGlobal = 300000;

            public int getMaxInputChars() {
                return maxInputChars;
            }

            public void setMaxInputChars(int maxInputChars) {
                this.maxInputChars = maxInputChars;
            }

            public int getMaxOutputTokens() {
                return maxOutputTokens;
            }

            public void setMaxOutputTokens(int maxOutputTokens) {
                this.maxOutputTokens = maxOutputTokens;
            }

            public int getDailyTokensPerUser() {
                return dailyTokensPerUser;
            }

            public void setDailyTokensPerUser(int dailyTokensPerUser) {
                this.dailyTokensPerUser = dailyTokensPerUser;
            }

            public int getDailyTokensGlobal() {
                return dailyTokensGlobal;
            }

            public void setDailyTokensGlobal(int dailyTokensGlobal) {
                this.dailyTokensGlobal = dailyTokensGlobal;
            }
        }
    }
    // jhipster-needle-application-properties-property
    // jhipster-needle-application-properties-property-getter
    // jhipster-needle-application-properties-property-class
}
