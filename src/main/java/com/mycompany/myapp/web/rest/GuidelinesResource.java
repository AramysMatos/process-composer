package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Guidelines;
import com.mycompany.myapp.repository.GuidelinesRepository;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Guidelines}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class GuidelinesResource {

    private final Logger log = LoggerFactory.getLogger(GuidelinesResource.class);

    private static final String ENTITY_NAME = "guidelines";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GuidelinesRepository guidelinesRepository;

    private final LibraryEntityDeletionService libraryEntityDeletionService;

    public GuidelinesResource(GuidelinesRepository guidelinesRepository, LibraryEntityDeletionService libraryEntityDeletionService) {
        this.guidelinesRepository = guidelinesRepository;
        this.libraryEntityDeletionService = libraryEntityDeletionService;
    }

    /**
     * {@code POST  /guidelines} : Create a new guidelines.
     *
     * @param guidelines the guidelines to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new guidelines, or with status {@code 400 (Bad Request)} if the guidelines has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/guidelines")
    public ResponseEntity<Guidelines> createGuidelines(@RequestBody Guidelines guidelines) throws URISyntaxException {
        log.debug("REST request to save Guidelines : {}", guidelines);
        if (guidelines.getId() != null) {
            throw new BadRequestAlertException("A new guidelines cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Guidelines result = guidelinesRepository.save(guidelines);
        return ResponseEntity
            .created(new URI("/api/guidelines/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /guidelines/:id} : Updates an existing guidelines.
     *
     * @param id the id of the guidelines to save.
     * @param guidelines the guidelines to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated guidelines,
     * or with status {@code 400 (Bad Request)} if the guidelines is not valid,
     * or with status {@code 500 (Internal Server Error)} if the guidelines couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/guidelines/{id}")
    public ResponseEntity<Guidelines> updateGuidelines(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Guidelines guidelines
    ) throws URISyntaxException {
        log.debug("REST request to update Guidelines : {}, {}", id, guidelines);
        if (guidelines.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, guidelines.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!guidelinesRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Guidelines result = guidelinesRepository.save(guidelines);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, guidelines.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /guidelines/:id} : Partial updates given fields of an existing guidelines, field will ignore if it is null
     *
     * @param id the id of the guidelines to save.
     * @param guidelines the guidelines to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated guidelines,
     * or with status {@code 400 (Bad Request)} if the guidelines is not valid,
     * or with status {@code 404 (Not Found)} if the guidelines is not found,
     * or with status {@code 500 (Internal Server Error)} if the guidelines couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/guidelines/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Guidelines> partialUpdateGuidelines(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Guidelines guidelines
    ) throws URISyntaxException {
        log.debug("REST request to partial update Guidelines partially : {}, {}", id, guidelines);
        if (guidelines.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, guidelines.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!guidelinesRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Guidelines> result = guidelinesRepository
            .findById(guidelines.getId())
            .map(existingGuidelines -> {
                if (guidelines.getName() != null) {
                    existingGuidelines.setName(guidelines.getName());
                }
                if (guidelines.getDescription() != null) {
                    existingGuidelines.setDescription(guidelines.getDescription());
                }

                return existingGuidelines;
            })
            .map(guidelinesRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, guidelines.getId().toString())
        );
    }

    /**
     * {@code GET  /guidelines} : get all the guidelines.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of guidelines in body.
     */
    @GetMapping("/guidelines")
    public List<Guidelines> getAllGuidelines() {
        log.debug("REST request to get all Guidelines");
        return guidelinesRepository.findAll();
    }

    /**
     * {@code GET  /guidelines/:id} : get the "id" guidelines.
     *
     * @param id the id of the guidelines to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the guidelines, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/guidelines/{id}")
    public ResponseEntity<Guidelines> getGuidelines(@PathVariable Long id) {
        log.debug("REST request to get Guidelines : {}", id);
        Optional<Guidelines> guidelines = guidelinesRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(guidelines);
    }

    /**
     * {@code DELETE  /guidelines/:id} : delete the "id" guidelines.
     *
     * @param id the id of the guidelines to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/guidelines/{id}")
    public ResponseEntity<Void> deleteGuidelines(@PathVariable Long id) {
        log.debug("REST request to delete Guidelines : {}", id);
        libraryEntityDeletionService.deleteGuideline(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
