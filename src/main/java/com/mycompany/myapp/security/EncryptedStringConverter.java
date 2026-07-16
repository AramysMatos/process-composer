package com.mycompany.myapp.security;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA converter that transparently encrypts/decrypts sensitive string fields at rest.
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static GitHubTokenEncryptionService encryptionService;

    @Autowired
    public EncryptedStringConverter(GitHubTokenEncryptionService encryptionService) {
        EncryptedStringConverter.encryptionService = encryptionService;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (encryptionService == null || attribute == null || attribute.isBlank()) {
            return attribute;
        }
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (encryptionService == null || dbData == null || dbData.isBlank()) {
            return dbData;
        }
        return encryptionService.decrypt(dbData);
    }
}
