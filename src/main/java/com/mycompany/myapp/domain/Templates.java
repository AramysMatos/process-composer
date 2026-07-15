package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Templates.
 */
@Entity
@Table(name = "templates")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Templates implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany(mappedBy = "templates")
    @JsonIgnoreProperties(value = { "templates", "dependentActivities", "producingActivities" }, allowSetters = true)
    private Set<Artifacts> artifacts = new HashSet<>();

    @ManyToMany(mappedBy = "templates")
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
    private Set<Activity> activities = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Templates id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Templates name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Templates description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Artifacts> getArtifacts() {
        return this.artifacts;
    }

    public void setArtifacts(Set<Artifacts> artifacts) {
        if (this.artifacts != null) {
            this.artifacts.forEach(i -> i.removeTemplates(this));
        }
        if (artifacts != null) {
            artifacts.forEach(i -> i.addTemplates(this));
        }
        this.artifacts = artifacts;
    }

    public Templates artifacts(Set<Artifacts> artifacts) {
        this.setArtifacts(artifacts);
        return this;
    }

    public Templates addArtifacts(Artifacts artifacts) {
        this.artifacts.add(artifacts);
        artifacts.getTemplates().add(this);
        return this;
    }

    public Templates removeArtifacts(Artifacts artifacts) {
        this.artifacts.remove(artifacts);
        artifacts.getTemplates().remove(this);
        return this;
    }

    public Set<Activity> getActivities() {
        return this.activities;
    }

    public void setActivities(Set<Activity> activities) {
        if (this.activities != null) {
            this.activities.forEach(i -> i.removeTemplates(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addTemplates(this));
        }
        this.activities = activities;
    }

    public Templates activities(Set<Activity> activities) {
        this.setActivities(activities);
        return this;
    }

    public Templates addActivities(Activity activity) {
        this.activities.add(activity);
        activity.getTemplates().add(this);
        return this;
    }

    public Templates removeActivities(Activity activity) {
        this.activities.remove(activity);
        activity.getTemplates().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Templates)) {
            return false;
        }
        return id != null && id.equals(((Templates) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Templates{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
