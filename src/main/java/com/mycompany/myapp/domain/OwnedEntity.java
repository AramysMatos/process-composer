package com.mycompany.myapp.domain;

/**
 * Entity with user ownership for access control.
 * {@code owner == null} means a system template visible to all users (read-only for non-admins).
 */
public interface OwnedEntity {
    User getOwner();

    void setOwner(User owner);

    Long getOwnerId();

    void setOwnerId(Long ownerId);

    boolean isSystemTemplate();

    Boolean getSystemTemplate();

    void setSystemTemplate(Boolean systemTemplate);
}
