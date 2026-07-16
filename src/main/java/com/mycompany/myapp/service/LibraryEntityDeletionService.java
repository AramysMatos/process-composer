package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Artifacts;
import com.mycompany.myapp.domain.Guidelines;
import com.mycompany.myapp.domain.Roles;
import com.mycompany.myapp.domain.Templates;
import com.mycompany.myapp.domain.Tools;
import com.mycompany.myapp.repository.ArtifactsRepository;
import com.mycompany.myapp.repository.GuidelinesRepository;
import com.mycompany.myapp.repository.RolesRepository;
import com.mycompany.myapp.repository.TemplatesRepository;
import com.mycompany.myapp.repository.ToolsRepository;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.util.HashSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles library entity deletion by unlinking activity relationships before removal.
 */
@Service
@Transactional
public class LibraryEntityDeletionService {

    private final RolesRepository rolesRepository;
    private final ToolsRepository toolsRepository;
    private final GuidelinesRepository guidelinesRepository;
    private final ArtifactsRepository artifactsRepository;
    private final TemplatesRepository templatesRepository;

    public LibraryEntityDeletionService(
        RolesRepository rolesRepository,
        ToolsRepository toolsRepository,
        GuidelinesRepository guidelinesRepository,
        ArtifactsRepository artifactsRepository,
        TemplatesRepository templatesRepository
    ) {
        this.rolesRepository = rolesRepository;
        this.toolsRepository = toolsRepository;
        this.guidelinesRepository = guidelinesRepository;
        this.artifactsRepository = artifactsRepository;
        this.templatesRepository = templatesRepository;
    }

    public void deleteRole(Long id) {
        Roles role = rolesRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "roles", "idnotfound"));
        new HashSet<>(role.getParticipantActivities()).forEach(role::removeParticipantActivities);
        new HashSet<>(role.getResponsibleActivities()).forEach(role::removeResponsibleActivities);
        rolesRepository.delete(role);
    }

    public void deleteTool(Long id) {
        Tools tool = toolsRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "tools", "idnotfound"));
        new HashSet<>(tool.getActivities()).forEach(tool::removeActivities);
        toolsRepository.delete(tool);
    }

    public void deleteGuideline(Long id) {
        Guidelines guideline = guidelinesRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "guidelines", "idnotfound"));
        new HashSet<>(guideline.getActivities()).forEach(guideline::removeActivities);
        guidelinesRepository.delete(guideline);
    }

    public void deleteArtifact(Long id) {
        Artifacts artifact = artifactsRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "artifacts", "idnotfound"));
        new HashSet<>(artifact.getTemplates()).forEach(artifact::removeTemplates);
        new HashSet<>(artifact.getDependentActivities()).forEach(artifact::removeDependentActivities);
        new HashSet<>(artifact.getProducingActivities()).forEach(artifact::removeProducingActivities);
        artifactsRepository.delete(artifact);
    }

    public void deleteTemplate(Long id) {
        Templates template = templatesRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "templates", "idnotfound"));
        new HashSet<>(template.getArtifacts()).forEach(template::removeArtifacts);
        new HashSet<>(template.getActivities()).forEach(template::removeActivities);
        templatesRepository.delete(template);
    }
}
