package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Process.
 */
@Entity
@Table(name = "process")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Process extends AbstractOwnedAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "process_name")
    private String processName;

    @Column(name = "process_description")
    private String processDescription;

    @OneToMany(mappedBy = "process")
    @JsonIgnoreProperties(value = { "activities", "process" }, allowSetters = true)
    private Set<Phase> phases = new HashSet<>();

    @OneToMany(mappedBy = "process")
    @JsonIgnoreProperties(value = { "tasks", "process" }, allowSetters = true)
    private Set<Project> projects = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    @Override
    public Long getId() {
        return this.id;
    }

    public Process id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProcessName() {
        return this.processName;
    }

    public Process processName(String processName) {
        this.setProcessName(processName);
        return this;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public String getProcessDescription() {
        return this.processDescription;
    }

    public Process processDescription(String processDescription) {
        this.setProcessDescription(processDescription);
        return this;
    }

    public void setProcessDescription(String processDescription) {
        this.processDescription = processDescription;
    }

    public Set<Phase> getPhases() {
        return this.phases;
    }

    public void setPhases(Set<Phase> phases) {
        if (this.phases != null) {
            this.phases.forEach(i -> i.setProcess(null));
        }
        if (phases != null) {
            phases.forEach(i -> i.setProcess(this));
        }
        this.phases = phases;
    }

    public Process phases(Set<Phase> phases) {
        this.setPhases(phases);
        return this;
    }

    public Process addPhase(Phase phase) {
        this.phases.add(phase);
        phase.setProcess(this);
        return this;
    }

    public Process removePhase(Phase phase) {
        this.phases.remove(phase);
        phase.setProcess(null);
        return this;
    }

    public Set<Project> getProjects() {
        return this.projects;
    }

    public void setProjects(Set<Project> projects) {
        if (this.projects != null) {
            this.projects.forEach(i -> i.setProcess(null));
        }
        if (projects != null) {
            projects.forEach(i -> i.setProcess(this));
        }
        this.projects = projects;
    }

    public Process projects(Set<Project> projects) {
        this.setProjects(projects);
        return this;
    }

    public Process addProject(Project project) {
        this.projects.add(project);
        project.setProcess(this);
        return this;
    }

    public Process removeProject(Project project) {
        this.projects.remove(project);
        project.setProcess(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Process)) {
            return false;
        }
        return id != null && id.equals(((Process) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Process{" +
            "id=" + getId() +
            ", processName='" + getProcessName() + "'" +
            ", processDescription='" + getProcessDescription() + "'" +
            "}";
    }
}
