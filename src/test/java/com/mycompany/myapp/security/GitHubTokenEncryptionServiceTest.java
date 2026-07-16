package com.mycompany.myapp.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GitHubTokenEncryptionServiceTest {

    private GitHubTokenEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new GitHubTokenEncryptionService("test-github-token-encryption-key-32b");
    }

    @Test
    void encryptAndDecrypt_roundTrip() {
        String plaintext = "ghp_testToken1234567890abcdef";

        String encrypted = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(encrypted);

        assertThat(encrypted).isNotEqualTo(plaintext);
        assertThat(decrypted).isEqualTo(plaintext);
    }

    @Test
    void encrypt_blankValues_passThrough() {
        assertThat(encryptionService.encrypt(null)).isNull();
        assertThat(encryptionService.encrypt("")).isEmpty();
        assertThat(encryptionService.decrypt(null)).isNull();
        assertThat(encryptionService.decrypt("")).isEmpty();
    }
}
