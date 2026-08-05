package com.mycompany.myapp.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$";

    public static final String SYSTEM = "system";
    public static final String DEFAULT_LANGUAGE = "en";

    private static final String POLI_UFRJ_EMAIL_SUFFIX = "@poli.ufrj.br";
    private static final String COS_UFRJ_EMAIL_SUFFIX = "@cos.ufrj.br";

    private Constants() {}

    public static boolean isAutoActivatedEmail(String email) {
        if (email == null) {
            return false;
        }
        String normalizedEmail = email.toLowerCase();
        return normalizedEmail.endsWith(POLI_UFRJ_EMAIL_SUFFIX) || normalizedEmail.endsWith(COS_UFRJ_EMAIL_SUFFIX);
    }
}
