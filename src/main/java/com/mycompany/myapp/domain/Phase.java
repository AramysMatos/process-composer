package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Phase.
 */
@Entity
@Table(name = "phase")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Phase extends AbstractOwnedAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "phase")
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

    @ManyToOne
    @JsonIgnoreProperties(value = { "phases", "projects" }, allowSetters = true)
    private Process process;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @Override
    public Long getId() {
        return this.id;
    }

    public Phase id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Phase name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Phase description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Activity> getActivities() {
        return this.activities;
    }

    public void setActivities(Set<Activity> activities) {
        if (this.activities != null) {
            this.activities.forEach(i -> i.setPhase(null));
        }
        if (activities != null) {
            activities.forEach(i -> i.setPhase(this));
        }
        this.activities = activities;
    }

    public Phase activities(Set<Activity> activities) {
        this.setActivities(activities);
        return this;
    }

    public Phase addActivity(Activity activity) {
        this.activities.add(activity);
        activity.setPhase(this);
        return this;
    }

    public Phase removeActivity(Activity activity) {
        this.activities.remove(activity);
        activity.setPhase(null);
        return this;
    }

    public Process getProcess() {
        return this.process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }

    public Phase process(Process process) {
        this.setProcess(process);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Phase)) {
            return false;
        }
        return id != null && id.equals(((Phase) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Phase{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
