package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Roles.
 */
@Entity
@Table(name = "roles")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Roles extends AbstractOwnedAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany(mappedBy = "participantRoles")
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
    private Set<Activity> participantActivities = new HashSet<>();

    @ManyToMany(mappedBy = "responsibleRoles")
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
    private Set<Activity> responsibleActivities = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @Override
    public Long getId() {
        return this.id;
    }

    public Roles id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Roles name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Roles description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Activity> getParticipantActivities() {
        return this.participantActivities;
    }

    public void setParticipantActivities(Set<Activity> activities) {
        if (this.participantActivities != null) {
            this.participantActivities.forEach(i -> i.removeParticipantRoles(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addParticipantRoles(this));
        }
        this.participantActivities = activities;
    }

    public Roles participantActivities(Set<Activity> activities) {
        this.setParticipantActivities(activities);
        return this;
    }

    public Roles addParticipantActivities(Activity activity) {
        this.participantActivities.add(activity);
        activity.getParticipantRoles().add(this);
        return this;
    }

    public Roles removeParticipantActivities(Activity activity) {
        this.participantActivities.remove(activity);
        activity.getParticipantRoles().remove(this);
        return this;
    }

    public Set<Activity> getResponsibleActivities() {
        return this.responsibleActivities;
    }

    public void setResponsibleActivities(Set<Activity> activities) {
        if (this.responsibleActivities != null) {
            this.responsibleActivities.forEach(i -> i.removeResponsibleRoles(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addResponsibleRoles(this));
        }
        this.responsibleActivities = activities;
    }

    public Roles responsibleActivities(Set<Activity> activities) {
        this.setResponsibleActivities(activities);
        return this;
    }

    public Roles addResponsibleActivities(Activity activity) {
        this.responsibleActivities.add(activity);
        activity.getResponsibleRoles().add(this);
        return this;
    }

    public Roles removeResponsibleActivities(Activity activity) {
        this.responsibleActivities.remove(activity);
        activity.getResponsibleRoles().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Roles)) {
            return false;
        }
        return id != null && id.equals(((Roles) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Roles{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
