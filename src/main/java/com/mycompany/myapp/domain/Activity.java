package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

/**
 * A Activity.
 */
@Entity
@Table(name = "activity")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Activity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "input_criterion")
    private String inputCriterion;

    @ManyToMany
    @JoinTable(
        name = "rel_activity__sub_activities",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "sub_activities_id")
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
    private Set<Activity> subActivities = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__templates",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "templates_id")
    )
    @JsonIgnoreProperties(value = { "artifacts", "activities" }, allowSetters = true)
    private Set<Templates> templates = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__guidelines",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "guidelines_id")
    )
    @JsonIgnoreProperties(value = { "activities" }, allowSetters = true)
    private Set<Guidelines> guidelines = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__participant_roles",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "participant_roles_id")
    )
    @JsonIgnoreProperties(value = { "participantActivities", "responsibleActivities" }, allowSetters = true)
    private Set<Roles> participantRoles = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__responsible_roles",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "responsible_roles_id")
    )
    @JsonIgnoreProperties(value = { "participantActivities", "responsibleActivities" }, allowSetters = true)
    private Set<Roles> responsibleRoles = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__tools",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "tools_id")
    )
    @JsonIgnoreProperties(value = { "activities" }, allowSetters = true)
    private Set<Tools> tools = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__required_artifacts",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "required_artifacts_id")
    )
    @JsonIgnoreProperties(value = { "templates", "dependentActivities", "producingActivities" }, allowSetters = true)
    private Set<Artifacts> requiredArtifacts = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "rel_activity__produced_artifacts",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "produced_artifacts_id")
    )
    @JsonIgnoreProperties(value = { "templates", "dependentActivities", "producingActivities" }, allowSetters = true)
    private Set<Artifacts> producedArtifacts = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "activities", "process" }, allowSetters = true)
    private Phase phase;

    @ManyToMany(mappedBy = "activities")
    @JsonIgnoreProperties(value = { "activities", "project" }, allowSetters = true)
    private Set<Task> tasks = new HashSet<>();

    @ManyToMany(mappedBy = "subActivities")
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
    private Set<Activity> predecessorActivities = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Activity id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Activity name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Activity description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInputCriterion() {
        return this.inputCriterion;
    }

    public Activity inputCriterion(String inputCriterion) {
        this.setInputCriterion(inputCriterion);
        return this;
    }

    public void setInputCriterion(String inputCriterion) {
        this.inputCriterion = inputCriterion;
    }

    public Set<Activity> getSubActivities() {
        return this.subActivities;
    }

    public void setSubActivities(Set<Activity> activities) {
        this.subActivities = activities;
    }

    public Activity subActivities(Set<Activity> activities) {
        this.setSubActivities(activities);
        return this;
    }

    public Activity addSubActivities(Activity activity) {
        this.subActivities.add(activity);
        activity.getPredecessorActivities().add(this);
        return this;
    }

    public Activity removeSubActivities(Activity activity) {
        this.subActivities.remove(activity);
        activity.getPredecessorActivities().remove(this);
        return this;
    }

    public Set<Templates> getTemplates() {
        return this.templates;
    }

    public void setTemplates(Set<Templates> templates) {
        this.templates = templates;
    }

    public Activity templates(Set<Templates> templates) {
        this.setTemplates(templates);
        return this;
    }

    public Activity addTemplates(Templates templates) {
        this.templates.add(templates);
        templates.getActivities().add(this);
        return this;
    }

    public Activity removeTemplates(Templates templates) {
        this.templates.remove(templates);
        templates.getActivities().remove(this);
        return this;
    }

    public Set<Guidelines> getGuidelines() {
        return this.guidelines;
    }

    public void setGuidelines(Set<Guidelines> guidelines) {
        this.guidelines = guidelines;
    }

    public Activity guidelines(Set<Guidelines> guidelines) {
        this.setGuidelines(guidelines);
        return this;
    }

    public Activity addGuidelines(Guidelines guidelines) {
        this.guidelines.add(guidelines);
        guidelines.getActivities().add(this);
        return this;
    }

    public Activity removeGuidelines(Guidelines guidelines) {
        this.guidelines.remove(guidelines);
        guidelines.getActivities().remove(this);
        return this;
    }

    public Set<Roles> getParticipantRoles() {
        return this.participantRoles;
    }

    public void setParticipantRoles(Set<Roles> roles) {
        this.participantRoles = roles;
    }

    public Activity participantRoles(Set<Roles> roles) {
        this.setParticipantRoles(roles);
        return this;
    }

    public Activity addParticipantRoles(Roles roles) {
        this.participantRoles.add(roles);
        roles.getParticipantActivities().add(this);
        return this;
    }

    public Activity removeParticipantRoles(Roles roles) {
        this.participantRoles.remove(roles);
        roles.getParticipantActivities().remove(this);
        return this;
    }

    public Set<Roles> getResponsibleRoles() {
        return this.responsibleRoles;
    }

    public void setResponsibleRoles(Set<Roles> roles) {
        this.responsibleRoles = roles;
    }

    public Activity responsibleRoles(Set<Roles> roles) {
        this.setResponsibleRoles(roles);
        return this;
    }

    public Activity addResponsibleRoles(Roles roles) {
        this.responsibleRoles.add(roles);
        roles.getResponsibleActivities().add(this);
        return this;
    }

    public Activity removeResponsibleRoles(Roles roles) {
        this.responsibleRoles.remove(roles);
        roles.getResponsibleActivities().remove(this);
        return this;
    }

    public Set<Tools> getTools() {
        return this.tools;
    }

    public void setTools(Set<Tools> tools) {
        this.tools = tools;
    }

    public Activity tools(Set<Tools> tools) {
        this.setTools(tools);
        return this;
    }

    public Activity addTools(Tools tools) {
        this.tools.add(tools);
        tools.getActivities().add(this);
        return this;
    }

    public Activity removeTools(Tools tools) {
        this.tools.remove(tools);
        tools.getActivities().remove(this);
        return this;
    }

    public Set<Artifacts> getRequiredArtifacts() {
        return this.requiredArtifacts;
    }

    public void setRequiredArtifacts(Set<Artifacts> artifacts) {
        this.requiredArtifacts = artifacts;
    }

    public Activity requiredArtifacts(Set<Artifacts> artifacts) {
        this.setRequiredArtifacts(artifacts);
        return this;
    }

    public Activity addRequiredArtifacts(Artifacts artifacts) {
        this.requiredArtifacts.add(artifacts);
        artifacts.getDependentActivities().add(this);
        return this;
    }

    public Activity removeRequiredArtifacts(Artifacts artifacts) {
        this.requiredArtifacts.remove(artifacts);
        artifacts.getDependentActivities().remove(this);
        return this;
    }

    public Set<Artifacts> getProducedArtifacts() {
        return this.producedArtifacts;
    }

    public void setProducedArtifacts(Set<Artifacts> artifacts) {
        this.producedArtifacts = artifacts;
    }

    public Activity producedArtifacts(Set<Artifacts> artifacts) {
        this.setProducedArtifacts(artifacts);
        return this;
    }

    public Activity addProducedArtifacts(Artifacts artifacts) {
        this.producedArtifacts.add(artifacts);
        artifacts.getProducingActivities().add(this);
        return this;
    }

    public Activity removeProducedArtifacts(Artifacts artifacts) {
        this.producedArtifacts.remove(artifacts);
        artifacts.getProducingActivities().remove(this);
        return this;
    }

    public Phase getPhase() {
        return this.phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
    }

    public Activity phase(Phase phase) {
        this.setPhase(phase);
        return this;
    }

    public Set<Task> getTasks() {
        return this.tasks;
    }

    public void setTasks(Set<Task> tasks) {
        if (this.tasks != null) {
            this.tasks.forEach(i -> i.removeActivities(this));
        }
        if (tasks != null) {
            tasks.forEach(i -> i.addActivities(this));
        }
        this.tasks = tasks;
    }

    public Activity tasks(Set<Task> tasks) {
        this.setTasks(tasks);
        return this;
    }

    public Activity addTasks(Task task) {
        this.tasks.add(task);
        task.getActivities().add(this);
        return this;
    }

    public Activity removeTasks(Task task) {
        this.tasks.remove(task);
        task.getActivities().remove(this);
        return this;
    }

    public Set<Activity> getPredecessorActivities() {
        return this.predecessorActivities;
    }

    public void setPredecessorActivities(Set<Activity> activities) {
        if (this.predecessorActivities != null) {
            this.predecessorActivities.forEach(i -> i.removeSubActivities(this));
        }
        if (activities != null) {
            activities.forEach(i -> i.addSubActivities(this));
        }
        this.predecessorActivities = activities;
    }

    public Activity predecessorActivities(Set<Activity> activities) {
        this.setPredecessorActivities(activities);
        return this;
    }

    public Activity addPredecessorActivities(Activity activity) {
        this.predecessorActivities.add(activity);
        activity.getSubActivities().add(this);
        return this;
    }

    public Activity removePredecessorActivities(Activity activity) {
        this.predecessorActivities.remove(activity);
        activity.getSubActivities().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Activity)) {
            return false;
        }
        return id != null && id.equals(((Activity) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Activity{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", inputCriterion='" + getInputCriterion() + "'" +
            "}";
    }
}
