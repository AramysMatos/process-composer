package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mycompany.myapp.domain.enumeration.AiFeature;
import java.io.Serializable;
import java.time.Instant;
import javax.persistence.*;
import javax.validation.constraints.NotNull;

/**
 * Audit log of AI token usage per user and feature.
 */
@Entity
@Table(name = "ai_usage_log")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AiUsageLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties(value = { "authorities", "password", "activationKey", "resetKey", "resetDate", "langKey" })
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "feature", length = 50, nullable = false)
    private AiFeature feature;

    @NotNull
    @Column(name = "input_tokens", nullable = false)
    private Integer inputTokens;

    @NotNull
    @Column(name = "output_tokens", nullable = false)
    private Integer outputTokens;

    @Column(name = "created_at")
    private Instant createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AiUsageLog id(Long id) {
        this.setId(id);
        return this;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public AiUsageLog user(User user) {
        this.setUser(user);
        return this;
    }

    public AiFeature getFeature() {
        return feature;
    }

    public void setFeature(AiFeature feature) {
        this.feature = feature;
    }

    public AiUsageLog feature(AiFeature feature) {
        this.setFeature(feature);
        return this;
    }

    public Integer getInputTokens() {
        return inputTokens;
    }

    public void setInputTokens(Integer inputTokens) {
        this.inputTokens = inputTokens;
    }

    public AiUsageLog inputTokens(Integer inputTokens) {
        this.setInputTokens(inputTokens);
        return this;
    }

    public Integer getOutputTokens() {
        return outputTokens;
    }

    public void setOutputTokens(Integer outputTokens) {
        this.outputTokens = outputTokens;
    }

    public AiUsageLog outputTokens(Integer outputTokens) {
        this.setOutputTokens(outputTokens);
        return this;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public AiUsageLog createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AiUsageLog)) {
            return false;
        }
        return id != null && id.equals(((AiUsageLog) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "AiUsageLog{" + "id=" + getId() + ", feature='" + getFeature() + "'" + "}";
    }
}
