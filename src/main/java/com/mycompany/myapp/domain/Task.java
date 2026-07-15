package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Task.
 */
@Entity
@Table(name = "task")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "git_hub_url")
    private String gitHubUrl;

    @Column(name = "git_hub_node_id")
    private String gitHubNodeId;

    @ManyToMany
    @JoinTable(
        name = "rel_task__activities",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "activities_id")
    )
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
    @JsonIgnoreProperties(value = { "tasks", "process" }, allowSetters = true)
    private Project project;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Task id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Task name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Task description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGitHubUrl() {
        return this.gitHubUrl;
    }

    public Task gitHubUrl(String gitHubUrl) {
        this.setGitHubUrl(gitHubUrl);
        return this;
    }

    public void setGitHubUrl(String gitHubUrl) {
        this.gitHubUrl = gitHubUrl;
    }

    public String getGitHubNodeId() {
        return this.gitHubNodeId;
    }

    public Task gitHubNodeId(String gitHubNodeId) {
        this.setGitHubNodeId(gitHubNodeId);
        return this;
    }

    public void setGitHubNodeId(String gitHubNodeId) {
        this.gitHubNodeId = gitHubNodeId;
    }

    public Set<Activity> getActivities() {
        return this.activities;
    }

    public void setActivities(Set<Activity> activities) {
        this.activities = activities;
    }

    public Task activities(Set<Activity> activities) {
        this.setActivities(activities);
        return this;
    }

    public Task addActivities(Activity activity) {
        this.activities.add(activity);
        activity.getTasks().add(this);
        return this;
    }

    public Task removeActivities(Activity activity) {
        this.activities.remove(activity);
        activity.getTasks().remove(this);
        return this;
    }

    public Project getProject() {
        return this.project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Task project(Project project) {
        this.setProject(project);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Task)) {
            return false;
        }
        return id != null && id.equals(((Task) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Task{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", gitHubUrl='" + getGitHubUrl() + "'" +
            ", gitHubNodeId='" + getGitHubNodeId() + "'" +
            "}";
    }
}
