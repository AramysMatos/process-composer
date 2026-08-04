package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Artifacts;
import com.mycompany.myapp.repository.ArtifactsRepository;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Artifacts}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class ArtifactsResource {

    private final Logger log = LoggerFactory.getLogger(ArtifactsResource.class);

    private static final String ENTITY_NAME = "artifacts";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ArtifactsRepository artifactsRepository;
    private final LibraryEntityDeletionService libraryEntityDeletionService;
    private final EntityAccessService entityAccessService;
    private final LibraryCloneService libraryCloneService;

    public ArtifactsResource(
        ArtifactsRepository artifactsRepository,
        LibraryEntityDeletionService libraryEntityDeletionService,
        EntityAccessService entityAccessService,
        LibraryCloneService libraryCloneService
    ) {
        this.artifactsRepository = artifactsRepository;
        this.libraryEntityDeletionService = libraryEntityDeletionService;
        this.entityAccessService = entityAccessService;
        this.libraryCloneService = libraryCloneService;
    }

    /**
     * {@code POST  /artifacts} : Create a new artifacts.
     *
     * @param artifacts the artifacts to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new artifacts, or with status {@code 400 (Bad Request)} if the artifacts has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/artifacts")
    public ResponseEntity<Artifacts> createArtifacts(@RequestBody Artifacts artifacts) throws URISyntaxException {
        log.debug("REST request to save Artifacts : {}", artifacts);
        if (artifacts.getId() != null) {
            throw new BadRequestAlertException("A new artifacts cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Artifacts result = artifactsRepository.save(entityAccessService.prepareForCreate(artifacts));
        return ResponseEntity
            .created(new URI("/api/artifacts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /artifacts/:id} : Updates an existing artifacts.
     *
     * @param id the id of the artifacts to save.
     * @param artifacts the artifacts to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated artifacts,
     * or with status {@code 400 (Bad Request)} if the artifacts is not valid,
     * or with status {@code 500 (Internal Server Error)} if the artifacts couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/artifacts/{id}")
    public ResponseEntity<Artifacts> updateArtifacts(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Artifacts artifacts
    ) throws URISyntaxException {
        log.debug("REST request to update Artifacts : {}, {}", id, artifacts);
        if (artifacts.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, artifacts.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Artifacts existing = artifactsRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        entityAccessService.preserveOwnerOnUpdate(existing, artifacts);

        Artifacts result = artifactsRepository.save(artifacts);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, artifacts.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /artifacts/:id} : Partial updates given fields of an existing artifacts, field will ignore if it is null
     *
     * @param id the id of the artifacts to save.
     * @param artifacts the artifacts to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated artifacts,
     * or with status {@code 400 (Bad Request)} if the artifacts is not valid,
     * or with status {@code 404 (Not Found)} if the artifacts is not found,
     * or with status {@code 500 (Internal Server Error)} if the artifacts couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/artifacts/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Artifacts> partialUpdateArtifacts(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Artifacts artifacts
    ) throws URISyntaxException {
        log.debug("REST request to partial update Artifacts partially : {}, {}", id, artifacts);
        if (artifacts.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, artifacts.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<Artifacts> result = artifactsRepository
            .findById(artifacts.getId())
            .map(existingArtifacts -> {
                entityAccessService.assertCanWrite(existingArtifacts);
                if (artifacts.getName() != null) {
                    existingArtifacts.setName(artifacts.getName());
                }
                if (artifacts.getDescription() != null) {
                    existingArtifacts.setDescription(artifacts.getDescription());
                }
                if (artifacts.getOptional() != null) {
                    existingArtifacts.setOptional(artifacts.getOptional());
                }

                return existingArtifacts;
            })
            .map(artifactsRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, artifacts.getId().toString())
        );
    }

    /**
     * {@code GET  /artifacts} : get all the artifacts.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of artifacts in body.
     */
    @GetMapping("/artifacts")
    public List<Artifacts> getAllArtifacts(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Artifacts");
        if (entityAccessService.isAdmin()) {
            if (eagerload) {
                return artifactsRepository.findAllWithEagerRelationships();
            }
            return artifactsRepository.findAll();
        }
        List<Artifacts> artifacts = artifactsRepository.findAllVisibleToUser(entityAccessService.getCurrentUserId());
        if (eagerload) {
            return artifactsRepository.fetchBagRelationships(artifacts);
        }
        return artifacts;
    }

    /**
     * {@code GET  /artifacts/:id} : get the "id" artifacts.
     *
     * @param id the id of the artifacts to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the artifacts, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/artifacts/{id}")
    public ResponseEntity<Artifacts> getArtifacts(@PathVariable Long id) {
        log.debug("REST request to get Artifacts : {}", id);
        Optional<Artifacts> artifacts = entityAccessService.isAdmin()
            ? artifactsRepository.findOneWithEagerRelationships(id)
            : artifactsRepository
                .findVisibleToUser(id, entityAccessService.getCurrentUserId())
                .flatMap(a -> artifactsRepository.findOneWithEagerRelationships(id));
        artifacts.ifPresent(entityAccessService::assertCanRead);
        return ResponseUtil.wrapOrNotFound(artifacts);
    }

    @PostMapping("/artifacts/{id}/clone")
    public ResponseEntity<Artifacts> cloneArtifacts(@PathVariable Long id) throws URISyntaxException {
        log.debug("REST request to clone Artifacts : {}", id);
        Artifacts result = libraryCloneService.cloneArtifact(id);
        return ResponseEntity
            .created(new URI("/api/artifacts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code DELETE  /artifacts/:id} : delete the "id" artifacts.
     *
     * @param id the id of the artifacts to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/artifacts/{id}")
    public ResponseEntity<Void> deleteArtifacts(@PathVariable Long id) {
        log.debug("REST request to delete Artifacts : {}", id);
        Artifacts existing = artifactsRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        libraryEntityDeletionService.deleteArtifact(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
