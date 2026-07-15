package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Templates;
import com.mycompany.myapp.repository.TemplatesRepository;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Templates}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class TemplatesResource {

    private final Logger log = LoggerFactory.getLogger(TemplatesResource.class);

    private static final String ENTITY_NAME = "templates";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TemplatesRepository templatesRepository;

    public TemplatesResource(TemplatesRepository templatesRepository) {
        this.templatesRepository = templatesRepository;
    }

    /**
     * {@code POST  /templates} : Create a new templates.
     *
     * @param templates the templates to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new templates, or with status {@code 400 (Bad Request)} if the templates has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/templates")
    public ResponseEntity<Templates> createTemplates(@RequestBody Templates templates) throws URISyntaxException {
        log.debug("REST request to save Templates : {}", templates);
        if (templates.getId() != null) {
            throw new BadRequestAlertException("A new templates cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Templates result = templatesRepository.save(templates);
        return ResponseEntity
            .created(new URI("/api/templates/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /templates/:id} : Updates an existing templates.
     *
     * @param id the id of the templates to save.
     * @param templates the templates to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated templates,
     * or with status {@code 400 (Bad Request)} if the templates is not valid,
     * or with status {@code 500 (Internal Server Error)} if the templates couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/templates/{id}")
    public ResponseEntity<Templates> updateTemplates(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Templates templates
    ) throws URISyntaxException {
        log.debug("REST request to update Templates : {}, {}", id, templates);
        if (templates.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, templates.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!templatesRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Templates result = templatesRepository.save(templates);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, templates.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /templates/:id} : Partial updates given fields of an existing templates, field will ignore if it is null
     *
     * @param id the id of the templates to save.
     * @param templates the templates to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated templates,
     * or with status {@code 400 (Bad Request)} if the templates is not valid,
     * or with status {@code 404 (Not Found)} if the templates is not found,
     * or with status {@code 500 (Internal Server Error)} if the templates couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/templates/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Templates> partialUpdateTemplates(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Templates templates
    ) throws URISyntaxException {
        log.debug("REST request to partial update Templates partially : {}, {}", id, templates);
        if (templates.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, templates.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!templatesRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Templates> result = templatesRepository
            .findById(templates.getId())
            .map(existingTemplates -> {
                if (templates.getName() != null) {
                    existingTemplates.setName(templates.getName());
                }
                if (templates.getDescription() != null) {
                    existingTemplates.setDescription(templates.getDescription());
                }

                return existingTemplates;
            })
            .map(templatesRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, templates.getId().toString())
        );
    }

    /**
     * {@code GET  /templates} : get all the templates.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of templates in body.
     */
    @GetMapping("/templates")
    public List<Templates> getAllTemplates() {
        log.debug("REST request to get all Templates");
        return templatesRepository.findAll();
    }

    /**
     * {@code GET  /templates/:id} : get the "id" templates.
     *
     * @param id the id of the templates to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the templates, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/templates/{id}")
    public ResponseEntity<Templates> getTemplates(@PathVariable Long id) {
        log.debug("REST request to get Templates : {}", id);
        Optional<Templates> templates = templatesRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(templates);
    }

    /**
     * {@code DELETE  /templates/:id} : delete the "id" templates.
     *
     * @param id the id of the templates to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplates(@PathVariable Long id) {
        log.debug("REST request to delete Templates : {}", id);
        templatesRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
