package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Roles;
import com.mycompany.myapp.repository.RolesRepository;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Roles}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class RolesResource {

    private final Logger log = LoggerFactory.getLogger(RolesResource.class);

    private static final String ENTITY_NAME = "roles";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RolesRepository rolesRepository;
    private final LibraryEntityDeletionService libraryEntityDeletionService;
    private final EntityAccessService entityAccessService;
    private final LibraryCloneService libraryCloneService;

    public RolesResource(
        RolesRepository rolesRepository,
        LibraryEntityDeletionService libraryEntityDeletionService,
        EntityAccessService entityAccessService,
        LibraryCloneService libraryCloneService
    ) {
        this.rolesRepository = rolesRepository;
        this.libraryEntityDeletionService = libraryEntityDeletionService;
        this.entityAccessService = entityAccessService;
        this.libraryCloneService = libraryCloneService;
    }

    @PostMapping("/roles")
    public ResponseEntity<Roles> createRoles(@RequestBody Roles roles) throws URISyntaxException {
        log.debug("REST request to save Roles : {}", roles);
        if (roles.getId() != null) {
            throw new BadRequestAlertException("A new roles cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Roles result = rolesRepository.save(entityAccessService.prepareForCreate(roles));
        return ResponseEntity
            .created(new URI("/api/roles/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Roles> updateRoles(@PathVariable(value = "id", required = false) final Long id, @RequestBody Roles roles)
        throws URISyntaxException {
        log.debug("REST request to update Roles : {}, {}", id, roles);
        if (roles.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, roles.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Roles existing = rolesRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        entityAccessService.preserveOwnerOnUpdate(existing, roles);

        Roles result = rolesRepository.save(roles);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, roles.getId().toString()))
            .body(result);
    }

    @PatchMapping(value = "/roles/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Roles> partialUpdateRoles(@PathVariable(value = "id", required = false) final Long id, @RequestBody Roles roles)
        throws URISyntaxException {
        log.debug("REST request to partial update Roles partially : {}, {}", id, roles);
        if (roles.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, roles.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<Roles> result = rolesRepository
            .findById(roles.getId())
            .map(existingRoles -> {
                entityAccessService.assertCanWrite(existingRoles);
                if (roles.getName() != null) {
                    existingRoles.setName(roles.getName());
                }
                if (roles.getDescription() != null) {
                    existingRoles.setDescription(roles.getDescription());
                }
                return existingRoles;
            })
            .map(rolesRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, roles.getId().toString())
        );
    }

    @GetMapping("/roles")
    public List<Roles> getAllRoles() {
        log.debug("REST request to get all Roles");
        if (entityAccessService.isAdmin()) {
            return rolesRepository.findAll();
        }
        return rolesRepository.findAllVisibleToUser(entityAccessService.getCurrentUserId());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Roles> getRoles(@PathVariable Long id) {
        log.debug("REST request to get Roles : {}", id);
        Optional<Roles> roles = rolesRepository.findById(id);
        roles.ifPresent(entityAccessService::assertCanRead);
        return ResponseUtil.wrapOrNotFound(roles.flatMap(r -> rolesRepository.findOneWithEagerRelationships(id)));
    }

    @PostMapping("/roles/{id}/clone")
    public ResponseEntity<Roles> cloneRoles(@PathVariable Long id) throws URISyntaxException {
        log.debug("REST request to clone Roles : {}", id);
        Roles result = libraryCloneService.cloneRole(id);
        return ResponseEntity
            .created(new URI("/api/roles/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRoles(@PathVariable Long id) {
        log.debug("REST request to delete Roles : {}", id);
        Roles existing = rolesRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        libraryEntityDeletionService.deleteRole(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
