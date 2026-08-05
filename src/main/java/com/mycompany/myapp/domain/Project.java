package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Project.
 */
@Entity
@Table(name = "project")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Project extends AbstractOwnedAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JsonProperty(access = Access.WRITE_ONLY)
    @Column(name = "git_hub_token", length = 512)
    private String gitHubToken;

    @Column(name = "git_hub_repository")
    private String gitHubRepository;

    @Column(name = "git_hub_node_id")
    private String gitHubNodeId;

    @OneToMany(mappedBy = "project")
    @JsonIgnoreProperties(value = { "activities", "project" }, allowSetters = true)
    private Set<Task> tasks = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "phases", "projects" }, allowSetters = true)
    private Process process;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @Override
    public Long getId() {
        return this.id;
    }

    public Project id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Project name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Project description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGitHubToken() {
        return this.gitHubToken;
    }

    public Project gitHubToken(String gitHubToken) {
        this.setGitHubToken(gitHubToken);
        return this;
    }

    public void setGitHubToken(String gitHubToken) {
        this.gitHubToken = gitHubToken;
    }

    @JsonProperty("gitHubTokenConfigured")
    public boolean isGitHubTokenConfigured() {
        return gitHubToken != null && !gitHubToken.isBlank();
    }

    public String getGitHubRepository() {
        return this.gitHubRepository;
    }

    public Project gitHubRepository(String gitHubRepository) {
        this.setGitHubRepository(gitHubRepository);
        return this;
    }

    public void setGitHubRepository(String gitHubRepository) {
        this.gitHubRepository = gitHubRepository;
    }

    public String getGitHubNodeId() {
        return this.gitHubNodeId;
    }

    public Project gitHubNodeId(String gitHubNodeId) {
        this.setGitHubNodeId(gitHubNodeId);
        return this;
    }

    public void setGitHubNodeId(String gitHubNodeId) {
        this.gitHubNodeId = gitHubNodeId;
    }

    public Set<Task> getTasks() {
        return this.tasks;
    }

    public void setTasks(Set<Task> tasks) {
        if (this.tasks != null) {
            this.tasks.forEach(i -> i.setProject(null));
        }
        if (tasks != null) {
            tasks.forEach(i -> i.setProject(this));
        }
        this.tasks = tasks;
    }

    public Project tasks(Set<Task> tasks) {
        this.setTasks(tasks);
        return this;
    }

    public Project addTask(Task task) {
        this.tasks.add(task);
        task.setProject(this);
        return this;
    }

    public Project removeTask(Task task) {
        this.tasks.remove(task);
        task.setProject(null);
        return this;
    }

    public Process getProcess() {
        return this.process;
    }

    public void setProcess(Process process) {
        this.process = process;
    }

    public Project process(Process process) {
        this.setProcess(process);
        return this;
    }

    @Override
    public boolean isSystemTemplate() {
        return false;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Project)) {
            return false;
        }
        return id != null && id.equals(((Project) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Project{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", gitHubToken='[protected]'" +
            ", gitHubRepository='" + getGitHubRepository() + "'" +
            ", gitHubNodeId='" + getGitHubNodeId() + "'" +
            "}";
    }
}
