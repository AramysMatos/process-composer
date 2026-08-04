package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;
import javax.persistence.Transient;

/**
 * Base class for owned domain entities with JPA auditing.
 */
@MappedSuperclass
public abstract class AbstractOwnedAuditingEntity<T> extends AbstractAuditingEntity<T> implements OwnedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties(value = { "authorities", "password", "activationKey", "resetKey", "resetDate", "langKey" })
    private User owner;

    @Transient
    private Boolean systemTemplate;

    @Override
    public User getOwner() {
        return owner;
    }

    @Override
    public void setOwner(User owner) {
        this.owner = owner;
    }

    @Override
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }

    @Override
    public void setOwnerId(Long ownerId) {
        if (ownerId == null) {
            this.owner = null;
            return;
        }
        User user = new User();
        user.setId(ownerId);
        this.owner = user;
    }

    @Override
    public boolean isSystemTemplate() {
        return owner == null;
    }

    @Override
    public Boolean getSystemTemplate() {
        return systemTemplate;
    }

    @Override
    public void setSystemTemplate(Boolean systemTemplate) {
        this.systemTemplate = systemTemplate;
    }
}
