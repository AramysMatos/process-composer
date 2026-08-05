package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Project;
import com.mycompany.myapp.repository.ProjectRepository;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.ReferenceAccessValidator;
import com.mycompany.myapp.service.TaskDeletionService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Project}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class ProjectResource {

    private final Logger log = LoggerFactory.getLogger(ProjectResource.class);

    private static final String ENTITY_NAME = "project";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProjectRepository projectRepository;
    private final TaskDeletionService taskDeletionService;
    private final EntityAccessService entityAccessService;
    private final ReferenceAccessValidator referenceAccessValidator;

    public ProjectResource(
        ProjectRepository projectRepository,
        TaskDeletionService taskDeletionService,
        EntityAccessService entityAccessService,
        ReferenceAccessValidator referenceAccessValidator
    ) {
        this.projectRepository = projectRepository;
        this.taskDeletionService = taskDeletionService;
        this.entityAccessService = entityAccessService;
        this.referenceAccessValidator = referenceAccessValidator;
    }

    /**
     * {@code POST  /projects} : Create a new project.
     *
     * @param project the project to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new project, or with status {@code 400 (Bad Request)} if the project has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@RequestBody Project project) throws URISyntaxException {
        log.debug("REST request to save Project : {}", project);
        if (project.getId() != null) {
            throw new BadRequestAlertException("A new project cannot already have an ID", ENTITY_NAME, "idexists");
        }
        entityAccessService.prepareForCreate(project);
        referenceAccessValidator.validateProjectReferences(project);
        Project result = projectRepository.save(project);
        return ResponseEntity
            .created(new URI("/api/projects/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /projects/:id} : Updates an existing project.
     *
     * @param id the id of the project to save.
     * @param project the project to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated project,
     * or with status {@code 400 (Bad Request)} if the project is not valid,
     * or with status {@code 500 (Internal Server Error)} if the project couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable(value = "id", required = false) final Long id, @RequestBody Project project)
        throws URISyntaxException {
        log.debug("REST request to update Project : {}, {}", id, project);
        if (project.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, project.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Project existing = projectRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        entityAccessService.preserveOwnerOnUpdate(existing, project);
        referenceAccessValidator.validateProjectReferences(project);

        Project result = projectRepository.save(project);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, project.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /projects/:id} : Partial updates given fields of an existing project, field will ignore if it is null
     *
     * @param id the id of the project to save.
     * @param project the project to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated project,
     * or with status {@code 400 (Bad Request)} if the project is not valid,
     * or with status {@code 404 (Not Found)} if the project is not found,
     * or with status {@code 500 (Internal Server Error)} if the project couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/projects/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Project> partialUpdateProject(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Project project
    ) throws URISyntaxException {
        log.debug("REST request to partial update Project partially : {}, {}", id, project);
        if (project.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, project.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<Project> result = projectRepository
            .findById(project.getId())
            .map(existingProject -> {
                entityAccessService.assertCanWrite(existingProject);
                referenceAccessValidator.validateProjectReferences(project);
                if (project.getName() != null) {
                    existingProject.setName(project.getName());
                }
                if (project.getDescription() != null) {
                    existingProject.setDescription(project.getDescription());
                }
                if (project.getGitHubToken() != null) {
                    existingProject.setGitHubToken(project.getGitHubToken());
                }
                if (project.getGitHubRepository() != null) {
                    existingProject.setGitHubRepository(project.getGitHubRepository());
                }
                if (project.getGitHubNodeId() != null) {
                    existingProject.setGitHubNodeId(project.getGitHubNodeId());
                }

                return existingProject;
            })
            .map(projectRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, project.getId().toString())
        );
    }

    /**
     * {@code GET  /projects} : get all the projects.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projects in body.
     */
    @GetMapping("/projects")
    public List<Project> getAllProjects(
        @RequestParam(required = false, defaultValue = "false") boolean eagerload,
        @RequestParam(required = false) Long ownerId,
        @RequestParam(required = false) Boolean systemOnly
    ) {
        log.debug("REST request to get all Projects");
        if (entityAccessService.isAdmin()) {
            if (Boolean.TRUE.equals(systemOnly) && ownerId != null) {
                throw new BadRequestAlertException("Cannot combine systemOnly and ownerId filters", ENTITY_NAME, "invalidfilter");
            }
            if (Boolean.TRUE.equals(systemOnly)) {
                return projectRepository.findAllSystemTemplates();
            }
            if (ownerId != null) {
                return projectRepository.findAllByOwnerId(ownerId);
            }
            if (eagerload) {
                return projectRepository.findAllWithEagerRelationships();
            }
            return projectRepository.findAllWithOwner();
        }
        List<Project> projects = projectRepository.findAllVisibleToUser(entityAccessService.getCurrentUserId());
        if (eagerload) {
            return projects
                .stream()
                .map(project -> projectRepository.findOneWithEagerRelationships(project.getId()).orElse(project))
                .collect(Collectors.toList());
        }
        return projects;
    }

    /**
     * {@code GET  /projects/:id} : get the "id" project.
     *
     * @param id the id of the project to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the project, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        log.debug("REST request to get Project : {}", id);
        Optional<Project> project = projectRepository.findOneWithEagerRelationships(id);
        project.ifPresent(entityAccessService::assertCanRead);
        return ResponseUtil.wrapOrNotFound(project);
    }

    /**
     * {@code DELETE  /projects/:id} : delete the "id" project.
     *
     * @param id the id of the project to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        log.debug("REST request to delete Project : {}", id);
        Project existing = projectRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        taskDeletionService.deleteTasksByProjectId(id);
        projectRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
