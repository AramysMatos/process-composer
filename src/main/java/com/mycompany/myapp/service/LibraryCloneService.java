package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.repository.*;
import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Clones library entities (Roles, Tools, etc.) for the current user.
 */
@Service
@Transactional
public class LibraryCloneService {

    private final EntityAccessService entityAccessService;
    private final RolesRepository rolesRepository;
    private final ToolsRepository toolsRepository;
    private final GuidelinesRepository guidelinesRepository;
    private final ArtifactsRepository artifactsRepository;
    private final TemplatesRepository templatesRepository;

    public LibraryCloneService(
        EntityAccessService entityAccessService,
        RolesRepository rolesRepository,
        ToolsRepository toolsRepository,
        GuidelinesRepository guidelinesRepository,
        ArtifactsRepository artifactsRepository,
        TemplatesRepository templatesRepository
    ) {
        this.entityAccessService = entityAccessService;
        this.rolesRepository = rolesRepository;
        this.toolsRepository = toolsRepository;
        this.guidelinesRepository = guidelinesRepository;
        this.artifactsRepository = artifactsRepository;
        this.templatesRepository = templatesRepository;
    }

    public Roles cloneRole(Long id) {
        Roles source = rolesRepository.findById(id).orElseThrow();
        entityAccessService.assertCanRead(source);
        Roles copy = new Roles().name(appendCopySuffix(source.getName())).description(source.getDescription());
        return rolesRepository.save(entityAccessService.prepareForCreate(copy));
    }

    public Tools cloneTool(Long id) {
        Tools source = toolsRepository.findById(id).orElseThrow();
        entityAccessService.assertCanRead(source);
        Tools copy = new Tools().name(appendCopySuffix(source.getName())).description(source.getDescription());
        return toolsRepository.save(entityAccessService.prepareForCreate(copy));
    }

    public Guidelines cloneGuideline(Long id) {
        Guidelines source = guidelinesRepository.findById(id).orElseThrow();
        entityAccessService.assertCanRead(source);
        Guidelines copy = new Guidelines().name(appendCopySuffix(source.getName())).description(source.getDescription());
        return guidelinesRepository.save(entityAccessService.prepareForCreate(copy));
    }

    public Artifacts cloneArtifact(Long id) {
        Artifacts source = artifactsRepository.findById(id).orElseThrow();
        entityAccessService.assertCanRead(source);
        Artifacts copy = new Artifacts()
            .name(appendCopySuffix(source.getName()))
            .description(source.getDescription())
            .optional(source.getOptional());
        return artifactsRepository.save(entityAccessService.prepareForCreate(copy));
    }

    public Templates cloneTemplate(Long id) {
        Templates source = templatesRepository.findOneWithEagerRelationships(id).orElseThrow();
        entityAccessService.assertCanRead(source);
        Templates copy = new Templates().name(appendCopySuffix(source.getName())).description(source.getDescription());
        if (source.getArtifacts() != null) {
            Set<Artifacts> artifacts = new HashSet<>();
            for (Artifacts artifact : source.getArtifacts()) {
                entityAccessService.assertCanRead(artifact);
                artifacts.add(artifact);
            }
            copy.setArtifacts(artifacts);
        }
        return templatesRepository.save(entityAccessService.prepareForCreate(copy));
    }

    private String appendCopySuffix(String name) {
        String base = name != null ? name : "";
        return base + " (cópia)";
    }
}
