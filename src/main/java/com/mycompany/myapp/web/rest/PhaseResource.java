package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Phase;
import com.mycompany.myapp.repository.PhaseRepository;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Phase}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class PhaseResource {

    private final Logger log = LoggerFactory.getLogger(PhaseResource.class);

    private static final String ENTITY_NAME = "phase";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PhaseRepository phaseRepository;

    public PhaseResource(PhaseRepository phaseRepository) {
        this.phaseRepository = phaseRepository;
    }

    /**
     * {@code POST  /phases} : Create a new phase.
     *
     * @param phase the phase to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new phase, or with status {@code 400 (Bad Request)} if the phase has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/phases")
    public ResponseEntity<Phase> createPhase(@RequestBody Phase phase) throws URISyntaxException {
        log.debug("REST request to save Phase : {}", phase);
        if (phase.getId() != null) {
            throw new BadRequestAlertException("A new phase cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Phase result = phaseRepository.save(phase);
        return ResponseEntity
            .created(new URI("/api/phases/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /phases/:id} : Updates an existing phase.
     *
     * @param id the id of the phase to save.
     * @param phase the phase to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated phase,
     * or with status {@code 400 (Bad Request)} if the phase is not valid,
     * or with status {@code 500 (Internal Server Error)} if the phase couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/phases/{id}")
    public ResponseEntity<Phase> updatePhase(@PathVariable(value = "id", required = false) final Long id, @RequestBody Phase phase)
        throws URISyntaxException {
        log.debug("REST request to update Phase : {}, {}", id, phase);
        if (phase.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, phase.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!phaseRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Phase result = phaseRepository.save(phase);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, phase.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /phases/:id} : Partial updates given fields of an existing phase, field will ignore if it is null
     *
     * @param id the id of the phase to save.
     * @param phase the phase to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated phase,
     * or with status {@code 400 (Bad Request)} if the phase is not valid,
     * or with status {@code 404 (Not Found)} if the phase is not found,
     * or with status {@code 500 (Internal Server Error)} if the phase couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/phases/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Phase> partialUpdatePhase(@PathVariable(value = "id", required = false) final Long id, @RequestBody Phase phase)
        throws URISyntaxException {
        log.debug("REST request to partial update Phase partially : {}, {}", id, phase);
        if (phase.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, phase.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!phaseRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Phase> result = phaseRepository
            .findById(phase.getId())
            .map(existingPhase -> {
                if (phase.getName() != null) {
                    existingPhase.setName(phase.getName());
                }
                if (phase.getDescription() != null) {
                    existingPhase.setDescription(phase.getDescription());
                }

                return existingPhase;
            })
            .map(phaseRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, phase.getId().toString())
        );
    }

    /**
     * {@code GET  /phases} : get all the phases.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of phases in body.
     */
    @GetMapping("/phases")
    public List<Phase> getAllPhases(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Phases");
        if (eagerload) {
            return phaseRepository.findAllWithEagerRelationships();
        } else {
            return phaseRepository.findAll();
        }
    }

    /**
     * {@code GET  /phases/:id} : get the "id" phase.
     *
     * @param id the id of the phase to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the phase, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/phases/{id}")
    public ResponseEntity<Phase> getPhase(@PathVariable Long id) {
        log.debug("REST request to get Phase : {}", id);
        Optional<Phase> phase = phaseRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(phase);
    }

    /**
     * {@code DELETE  /phases/:id} : delete the "id" phase.
     *
     * @param id the id of the phase to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/phases/{id}")
    public ResponseEntity<Void> deletePhase(@PathVariable Long id) {
        log.debug("REST request to delete Phase : {}", id);
        phaseRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
