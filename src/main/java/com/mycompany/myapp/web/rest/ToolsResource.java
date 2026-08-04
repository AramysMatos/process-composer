package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Tools;
import com.mycompany.myapp.repository.ToolsRepository;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.LibraryCloneService;
import com.mycompany.myapp.service.LibraryEntityDeletionService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Tools}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class ToolsResource {

    private final Logger log = LoggerFactory.getLogger(ToolsResource.class);

    private static final String ENTITY_NAME = "tools";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ToolsRepository toolsRepository;
    private final LibraryEntityDeletionService libraryEntityDeletionService;
    private final EntityAccessService entityAccessService;
    private final LibraryCloneService libraryCloneService;

    public ToolsResource(
        ToolsRepository toolsRepository,
        LibraryEntityDeletionService libraryEntityDeletionService,
        EntityAccessService entityAccessService,
        LibraryCloneService libraryCloneService
    ) {
        this.toolsRepository = toolsRepository;
        this.libraryEntityDeletionService = libraryEntityDeletionService;
        this.entityAccessService = entityAccessService;
        this.libraryCloneService = libraryCloneService;
    }

    /**
     * {@code POST  /tools} : Create a new tools.
     *
     * @param tools the tools to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tools, or with status {@code 400 (Bad Request)} if the tools has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/tools")
    public ResponseEntity<Tools> createTools(@RequestBody Tools tools) throws URISyntaxException {
        log.debug("REST request to save Tools : {}", tools);
        if (tools.getId() != null) {
            throw new BadRequestAlertException("A new tools cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Tools result = toolsRepository.save(entityAccessService.prepareForCreate(tools));
        return ResponseEntity
            .created(new URI("/api/tools/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /tools/:id} : Updates an existing tools.
     *
     * @param id the id of the tools to save.
     * @param tools the tools to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tools,
     * or with status {@code 400 (Bad Request)} if the tools is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tools couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/tools/{id}")
    public ResponseEntity<Tools> updateTools(@PathVariable(value = "id", required = false) final Long id, @RequestBody Tools tools)
        throws URISyntaxException {
        log.debug("REST request to update Tools : {}, {}", id, tools);
        if (tools.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tools.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Tools existing = toolsRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        entityAccessService.preserveOwnerOnUpdate(existing, tools);

        Tools result = toolsRepository.save(tools);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tools.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /tools/:id} : Partial updates given fields of an existing tools, field will ignore if it is null
     *
     * @param id the id of the tools to save.
     * @param tools the tools to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tools,
     * or with status {@code 400 (Bad Request)} if the tools is not valid,
     * or with status {@code 404 (Not Found)} if the tools is not found,
     * or with status {@code 500 (Internal Server Error)} if the tools couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/tools/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Tools> partialUpdateTools(@PathVariable(value = "id", required = false) final Long id, @RequestBody Tools tools)
        throws URISyntaxException {
        log.debug("REST request to partial update Tools partially : {}, {}", id, tools);
        if (tools.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tools.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<Tools> result = toolsRepository
            .findById(tools.getId())
            .map(existingTools -> {
                entityAccessService.assertCanWrite(existingTools);
                if (tools.getName() != null) {
                    existingTools.setName(tools.getName());
                }
                if (tools.getDescription() != null) {
                    existingTools.setDescription(tools.getDescription());
                }

                return existingTools;
            })
            .map(toolsRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tools.getId().toString())
        );
    }

    /**
     * {@code GET  /tools} : get all the tools.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tools in body.
     */
    @GetMapping("/tools")
    public List<Tools> getAllTools() {
        log.debug("REST request to get all Tools");
        if (entityAccessService.isAdmin()) {
            return toolsRepository.findAll();
        }
        return toolsRepository.findAllVisibleToUser(entityAccessService.getCurrentUserId());
    }

    /**
     * {@code GET  /tools/:id} : get the "id" tools.
     *
     * @param id the id of the tools to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tools, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/tools/{id}")
    public ResponseEntity<Tools> getTools(@PathVariable Long id) {
        log.debug("REST request to get Tools : {}", id);
        Optional<Tools> tools = entityAccessService.isAdmin()
            ? toolsRepository.findOneWithEagerRelationships(id)
            : toolsRepository
                .findVisibleToUser(id, entityAccessService.getCurrentUserId())
                .flatMap(t -> toolsRepository.findOneWithEagerRelationships(id));
        tools.ifPresent(entityAccessService::assertCanRead);
        return ResponseUtil.wrapOrNotFound(tools);
    }

    @PostMapping("/tools/{id}/clone")
    public ResponseEntity<Tools> cloneTools(@PathVariable Long id) throws URISyntaxException {
        log.debug("REST request to clone Tools : {}", id);
        Tools result = libraryCloneService.cloneTool(id);
        return ResponseEntity
            .created(new URI("/api/tools/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code DELETE  /tools/:id} : delete the "id" tools.
     *
     * @param id the id of the tools to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/tools/{id}")
    public ResponseEntity<Void> deleteTools(@PathVariable Long id) {
        log.debug("REST request to delete Tools : {}", id);
        Tools existing = toolsRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        libraryEntityDeletionService.deleteTool(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
