package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.OwnedEntity;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.security.AuthoritiesConstants;
import com.mycompany.myapp.security.SecurityUtils;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Centralizes ownership-based access control for domain entities.
 */
@Service
@Transactional(readOnly = true)
public class EntityAccessService {

    private final UserRepository userRepository;

    public EntityAccessService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        return SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean isAdmin() {
        return SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN);
    }

    public boolean canRead(OwnedEntity entity) {
        if (entity == null) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        if (entity.isSystemTemplate()) {
            return true;
        }
        return Objects.equals(entity.getOwnerId(), getCurrentUserId());
    }

    public boolean canWrite(OwnedEntity entity) {
        if (entity == null) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        if (entity.isSystemTemplate()) {
            return false;
        }
        return Objects.equals(entity.getOwnerId(), getCurrentUserId());
    }

    public void assertCanRead(OwnedEntity entity) {
        if (!canRead(entity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    public void assertCanWrite(OwnedEntity entity) {
        if (!canWrite(entity)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    public <T extends OwnedEntity> T prepareForCreate(T entity) {
        return prepareForCreate(entity, entity.getSystemTemplate());
    }

    public <T extends OwnedEntity> T prepareForCreate(T entity, Boolean asSystemTemplate) {
        if (Boolean.TRUE.equals(asSystemTemplate)) {
            if (!isAdmin()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can create system templates");
            }
            entity.setOwner(null);
        } else {
            entity.setOwner(getCurrentUser());
        }
        entity.setSystemTemplate(null);
        return entity;
    }

    public void preserveOwnerOnUpdate(OwnedEntity existing, OwnedEntity payload) {
        payload.setOwner(existing.getOwner());
        payload.setSystemTemplate(null);
    }

    public <T extends OwnedEntity> List<T> filterVisible(List<T> entities) {
        if (isAdmin()) {
            return entities;
        }
        return entities.stream().filter(this::canRead).collect(Collectors.toList());
    }
}
