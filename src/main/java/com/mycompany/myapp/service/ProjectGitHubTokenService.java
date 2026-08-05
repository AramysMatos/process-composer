package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Project;
import com.mycompany.myapp.security.GitHubTokenEncryptionService;
import org.springframework.stereotype.Service;

/**
 * Encrypts and decrypts GitHub tokens on behalf of {@link Project} persistence.
 */
@Service
public class ProjectGitHubTokenService {

    private final GitHubTokenEncryptionService encryptionService;

    public ProjectGitHubTokenService(GitHubTokenEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    public void storeToken(Project project, String plaintextToken) {
        if (plaintextToken == null || plaintextToken.isBlank()) {
            project.setGitHubToken(plaintextToken);
            return;
        }
        project.setGitHubToken(encryptionService.encrypt(plaintextToken.trim()));
    }

    public String readToken(Project project) {
        String stored = project.getGitHubToken();
        if (stored == null || stored.isBlank()) {
            return stored;
        }
        return encryptionService.decrypt(stored);
    }

    public void prepareForPersist(Project project) {
        String token = project.getGitHubToken();
        if (token == null || token.isBlank() || isEncrypted(token)) {
            return;
        }
        storeToken(project, token);
    }

    private boolean isEncrypted(String token) {
        try {
            encryptionService.decrypt(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
