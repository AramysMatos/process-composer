package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Artifacts.
 */
@Entity
@Table(name = "artifacts")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Artifacts extends AbstractOwnedAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "optional")
    private Boolean optional;

    @ManyToMany
    @JoinTable(
        name = "rel_artifacts__templates",
        joinColumns = @JoinColumn(name = "artifacts_id"),
        inverseJoinColumns = @JoinColumn(name = "templates_id")
    )
    @JsonIgnoreProperties(value = { "artifacts", "activities" }, allowSetters = true)
    private Set<Templates> templates = new HashSet<>();

    @ManyToMany(mappedBy = "requiredArtifacts")
    @JsonIgnoreProperties(
        value = {
            "subActivities",
            "templates",
            "guidelines",
            "participantRoles",
            "responsibleRoles",
            "tools",
            "requiredArtifacts",
            "producedArtifacts",
            "phase",
            "tasks",
            "predecessorActivities",
        },
        allowSetters = true
    )
    private Set<Activity> dependentActivities = new HashSet<>();

    @ManyToMany(mappedBy = "producedArtifacts")
    @JsonIgnoreProperties(
        value = {
            "subActivities",
            "templates",
            "guidelines",
            "participantRoles",
            "responsibleRoles",
            "tools",
            "requiredArtifacts",
            "producedArtifacts",
            "phase",
            "tasks",
            "predecessorActivities",
        },
        allowSetters = true
    )
    private Set<Activity> producingActivities = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @Override
    public Long getId() {
        return this.id;
    }

    public Artifacts id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Artifacts name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Artifacts description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getOptional() {
        return this.optional;
    }

    public Artifacts optional(Boolean optional) {
        this.setOptional(optional);
        return this;
    }

    public void setOptional(Boolean optional) {
        this.optional = optional;
    }

    public Set<Templates> getTemplates() {
        return this.templates;
    }

    public void setTemplates(Set<Templates> templates) {
        this.templates = templates;
    }

    public Artifacts templates(Set<Templates> templates) {
        this.setTemplates(templates);
        return this;
    }

    public Artifacts addTemplates(Templates templates) {
        this.templates.add(templates);
        templates.getArtifacts().add(this);
        return this;
    }

    public Artifacts removeTemplates(Templates templates) {
        this.templates.remove(templates);
        templates.getArtifacts().remove(this);
        return this;
    }

    public Set<Activity> getDependentActivities() {
        return this.dependentActivities;
    }

    public void setDependentActivities(Set<Activity> activities) {
        if (this.dependentActivities != null) {
            this.dependentActivities.forEach(i -> i.removeRequiredArtifacts(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addRequiredArtifacts(this));
        }
        this.dependentActivities = activities;
    }

    public Artifacts dependentActivities(Set<Activity> activities) {
        this.setDependentActivities(activities);
        return this;
    }

    public Artifacts addDependentActivities(Activity activity) {
        this.dependentActivities.add(activity);
        activity.getRequiredArtifacts().add(this);
        return this;
    }

    public Artifacts removeDependentActivities(Activity activity) {
        this.dependentActivities.remove(activity);
        activity.getRequiredArtifacts().remove(this);
        return this;
    }

    public Set<Activity> getProducingActivities() {
        return this.producingActivities;
    }

    public void setProducingActivities(Set<Activity> activities) {
        if (this.producingActivities != null) {
            this.producingActivities.forEach(i -> i.removeProducedArtifacts(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addProducedArtifacts(this));
        }
        this.producingActivities = activities;
    }

    public Artifacts producingActivities(Set<Activity> activities) {
        this.setProducingActivities(activities);
        return this;
    }

    public Artifacts addProducingActivities(Activity activity) {
        this.producingActivities.add(activity);
        activity.getProducedArtifacts().add(this);
        return this;
    }

    public Artifacts removeProducingActivities(Activity activity) {
        this.producingActivities.remove(activity);
        activity.getProducedArtifacts().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Artifacts)) {
            return false;
        }
        return id != null && id.equals(((Artifacts) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Artifacts{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", optional='" + getOptional() + "'" +
            "}";
    }
}
