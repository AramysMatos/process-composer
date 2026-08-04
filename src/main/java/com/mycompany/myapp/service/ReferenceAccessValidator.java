package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Activity;
import com.mycompany.myapp.domain.Artifacts;
import com.mycompany.myapp.domain.Guidelines;
import com.mycompany.myapp.domain.OwnedEntity;
import com.mycompany.myapp.domain.Phase;
import com.mycompany.myapp.domain.Project;
import com.mycompany.myapp.domain.Roles;
import com.mycompany.myapp.domain.Task;
import com.mycompany.myapp.domain.Templates;
import com.mycompany.myapp.domain.Tools;
import com.mycompany.myapp.repository.*;
import java.util.Collection;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Validates that referenced entities are visible to the current user.
 */
@Service
@Transactional(readOnly = true)
public class ReferenceAccessValidator {

    private final EntityAccessService entityAccessService;
    private final RolesRepository rolesRepository;
    private final ToolsRepository toolsRepository;
    private final GuidelinesRepository guidelinesRepository;
    private final ArtifactsRepository artifactsRepository;
    private final TemplatesRepository templatesRepository;
    private final ProcessRepository processRepository;
    private final PhaseRepository phaseRepository;
    private final ActivityRepository activityRepository;
    private final ProjectRepository projectRepository;

    public ReferenceAccessValidator(
        EntityAccessService entityAccessService,
        RolesRepository rolesRepository,
        ToolsRepository toolsRepository,
        GuidelinesRepository guidelinesRepository,
        ArtifactsRepository artifactsRepository,
        TemplatesRepository templatesRepository,
        ProcessRepository processRepository,
        PhaseRepository phaseRepository,
        ActivityRepository activityRepository,
        ProjectRepository projectRepository
    ) {
        this.entityAccessService = entityAccessService;
        this.rolesRepository = rolesRepository;
        this.toolsRepository = toolsRepository;
        this.guidelinesRepository = guidelinesRepository;
        this.artifactsRepository = artifactsRepository;
        this.templatesRepository = templatesRepository;
        this.processRepository = processRepository;
        this.phaseRepository = phaseRepository;
        this.activityRepository = activityRepository;
        this.projectRepository = projectRepository;
    }

    public void assertReadable(OwnedEntity entity) {
        entityAccessService.assertCanRead(entity);
    }

    public void assertReadableId(Long id, String entityType) {
        if (id == null) {
            return;
        }
        OwnedEntity entity = loadById(id, entityType);
        entityAccessService.assertCanRead(entity);
    }

    public void validateActivityReferences(Activity activity) {
        if (activity.getPhase() != null && activity.getPhase().getId() != null) {
            Phase phase = phaseRepository.findById(activity.getPhase().getId()).orElseThrow(() -> notFound("phase"));
            entityAccessService.assertCanRead(phase);
            inheritOwner(activity, phase);
        }
        validateCollection(activity.getParticipantRoles(), "roles");
        validateCollection(activity.getResponsibleRoles(), "roles");
        validateCollection(activity.getTools(), "tools");
        validateCollection(activity.getGuidelines(), "guidelines");
        validateCollection(activity.getTemplates(), "templates");
        validateCollection(activity.getRequiredArtifacts(), "artifacts");
        validateCollection(activity.getProducedArtifacts(), "artifacts");
        validateCollection(activity.getSubActivities(), "activity");
        validateCollection(activity.getPredecessorActivities(), "activity");
    }

    public void validatePhaseReferences(Phase phase) {
        if (phase.getProcess() != null && phase.getProcess().getId() != null) {
            com.mycompany.myapp.domain.Process process = processRepository
                .findById(phase.getProcess().getId())
                .orElseThrow(() -> notFound("process"));
            entityAccessService.assertCanRead(process);
            inheritOwner(phase, process);
        }
    }

    public void validateProjectReferences(Project project) {
        if (project.getProcess() != null && project.getProcess().getId() != null) {
            com.mycompany.myapp.domain.Process process = processRepository
                .findById(project.getProcess().getId())
                .orElseThrow(() -> notFound("process"));
            entityAccessService.assertCanRead(process);
        }
    }

    public void validateTemplatesReferences(Templates templates) {
        validateCollection(templates.getArtifacts(), "artifacts");
    }

    public void validateTaskReferences(Task task) {
        if (task.getProject() != null && task.getProject().getId() != null) {
            Project project = projectRepository.findById(task.getProject().getId()).orElseThrow(() -> notFound("project"));
            entityAccessService.assertCanRead(project);
            inheritOwner(task, project);
        }
        if (task.getActivities() != null) {
            for (Activity activity : task.getActivities()) {
                if (activity.getId() != null) {
                    Activity loaded = activityRepository.findById(activity.getId()).orElseThrow(() -> notFound("activity"));
                    entityAccessService.assertCanRead(loaded);
                }
            }
        }
    }

    private void validateCollection(Collection<?> entities, String entityType) {
        if (entities == null) {
            return;
        }
        for (Object item : entities) {
            if (item instanceof OwnedEntity) {
                OwnedEntity owned = (OwnedEntity) item;
                if (owned.getOwnerId() != null || owned.isSystemTemplate()) {
                    entityAccessService.assertCanRead(owned);
                } else if (owned instanceof Roles && ((Roles) owned).getId() != null) {
                    assertReadableId(((Roles) owned).getId(), "roles");
                } else if (owned instanceof Tools && ((Tools) owned).getId() != null) {
                    assertReadableId(((Tools) owned).getId(), "tools");
                } else if (owned instanceof Guidelines && ((Guidelines) owned).getId() != null) {
                    assertReadableId(((Guidelines) owned).getId(), "guidelines");
                } else if (owned instanceof Artifacts && ((Artifacts) owned).getId() != null) {
                    assertReadableId(((Artifacts) owned).getId(), "artifacts");
                } else if (owned instanceof Templates && ((Templates) owned).getId() != null) {
                    assertReadableId(((Templates) owned).getId(), "templates");
                } else if (owned instanceof Activity && ((Activity) owned).getId() != null) {
                    assertReadableId(((Activity) owned).getId(), "activity");
                }
            }
        }
    }

    private OwnedEntity loadById(Long id, String entityType) {
        switch (entityType) {
            case "roles":
                return rolesRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "tools":
                return toolsRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "guidelines":
                return guidelinesRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "artifacts":
                return artifactsRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "templates":
                return templatesRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "process":
                return processRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "phase":
                return phaseRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "activity":
                return activityRepository.findById(id).orElseThrow(() -> notFound(entityType));
            case "project":
                return projectRepository.findById(id).orElseThrow(() -> notFound(entityType));
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown entity type: " + entityType);
        }
    }

    private void inheritOwner(OwnedEntity child, OwnedEntity parent) {
        if (parent != null && !parent.isSystemTemplate()) {
            child.setOwner(parent.getOwner());
        } else if (parent != null && parent.isSystemTemplate()) {
            child.setOwner(entityAccessService.getCurrentUser());
        }
    }

    private ResponseStatusException notFound(String entityType) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, entityType + " not found");
    }
}
