package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Activity;
import com.mycompany.myapp.domain.Process;
import com.mycompany.myapp.repository.ActivityRepository;
import com.mycompany.myapp.repository.ProcessRepository;
import com.mycompany.myapp.service.ActivityDeletionService;
import com.mycompany.myapp.service.EntityAccessService;
import com.mycompany.myapp.service.ReferenceAccessValidator;
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
 * REST controller for managing {@link com.mycompany.myapp.domain.Activity}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class ActivityResource {

    private final Logger log = LoggerFactory.getLogger(ActivityResource.class);

    private static final String ENTITY_NAME = "activity";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ActivityRepository activityRepository;
    private final ProcessRepository processRepository;
    private final ActivityDeletionService activityDeletionService;
    private final EntityAccessService entityAccessService;
    private final ReferenceAccessValidator referenceAccessValidator;

    public ActivityResource(
        ActivityRepository activityRepository,
        ProcessRepository processRepository,
        ActivityDeletionService activityDeletionService,
        EntityAccessService entityAccessService,
        ReferenceAccessValidator referenceAccessValidator
    ) {
        this.activityRepository = activityRepository;
        this.processRepository = processRepository;
        this.activityDeletionService = activityDeletionService;
        this.entityAccessService = entityAccessService;
        this.referenceAccessValidator = referenceAccessValidator;
    }

    /**
     * {@code POST  /activities} : Create a new activity.
     *
     * @param activity the activity to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new activity, or with status {@code 400 (Bad Request)} if the activity has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/activities")
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) throws URISyntaxException {
        log.debug("REST request to save Activity : {}", activity);
        if (activity.getId() != null) {
            throw new BadRequestAlertException("A new activity cannot already have an ID", ENTITY_NAME, "idexists");
        }
        entityAccessService.prepareForCreate(activity);
        referenceAccessValidator.validateActivityReferences(activity);
        Activity result = activityRepository.save(activity);
        return ResponseEntity
            .created(new URI("/api/activities/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /activities/:id} : Updates an existing activity.
     *
     * @param id the id of the activity to save.
     * @param activity the activity to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activity,
     * or with status {@code 400 (Bad Request)} if the activity is not valid,
     * or with status {@code 500 (Internal Server Error)} if the activity couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/activities/{id}")
    public ResponseEntity<Activity> updateActivity(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Activity activity
    ) throws URISyntaxException {
        log.debug("REST request to update Activity : {}, {}", id, activity);
        if (activity.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activity.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Activity existing = activityRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        entityAccessService.preserveOwnerOnUpdate(existing, activity);
        referenceAccessValidator.validateActivityReferences(activity);

        Activity result = activityRepository.save(activity);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, activity.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /activities/:id} : Partial updates given fields of an existing activity, field will ignore if it is null
     *
     * @param id the id of the activity to save.
     * @param activity the activity to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated activity,
     * or with status {@code 400 (Bad Request)} if the activity is not valid,
     * or with status {@code 404 (Not Found)} if the activity is not found,
     * or with status {@code 500 (Internal Server Error)} if the activity couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/activities/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Activity> partialUpdateActivity(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody Activity activity
    ) throws URISyntaxException {
        log.debug("REST request to partial update Activity partially : {}, {}", id, activity);
        if (activity.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, activity.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<Activity> result = activityRepository
            .findById(activity.getId())
            .map(existingActivity -> {
                entityAccessService.assertCanWrite(existingActivity);
                referenceAccessValidator.validateActivityReferences(activity);
                if (activity.getName() != null) {
                    existingActivity.setName(activity.getName());
                }
                if (activity.getDescription() != null) {
                    existingActivity.setDescription(activity.getDescription());
                }
                if (activity.getInputCriterion() != null) {
                    existingActivity.setInputCriterion(activity.getInputCriterion());
                }

                return existingActivity;
            })
            .map(activityRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, activity.getId().toString())
        );
    }

    /**
     * {@code GET  /activities} : get all the activities.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of activities in body.
     */
    @GetMapping("/activities")
    public List<Activity> getAllActivities(
        @RequestParam(required = false, defaultValue = "false") boolean eagerload,
        @RequestParam(required = false) Boolean library,
        @RequestParam(required = false) Long processId,
        @RequestParam(required = false) Long phaseId
    ) {
        log.debug(
            "REST request to get all Activities (library={}, processId={}, phaseId={}, eagerload={})",
            library,
            processId,
            phaseId,
            eagerload
        );
        Long userId = entityAccessService.getCurrentUserId();
        boolean admin = entityAccessService.isAdmin();

        List<Activity> activities;
        if (Boolean.TRUE.equals(library)) {
            activities = admin ? activityRepository.findByPhaseIsNull() : activityRepository.findLibraryVisibleToUser(userId);
        } else if (processId != null) {
            Process process = processRepository
                .findById(processId)
                .orElseThrow(() -> new BadRequestAlertException("Entity not found", "process", "idnotfound"));
            entityAccessService.assertCanRead(process);
            activities =
                admin
                    ? activityRepository.findByPhase_Process_Id(processId)
                    : activityRepository.findByProcessIdVisibleToUser(processId, userId);
        } else if (phaseId != null) {
            activities =
                admin ? activityRepository.findByPhase_Id(phaseId) : activityRepository.findByPhaseIdVisibleToUser(phaseId, userId);
        } else if (eagerload) {
            activities = admin ? activityRepository.findAllWithEagerRelationships() : activityRepository.findAllVisibleToUser(userId);
        } else {
            return admin ? activityRepository.findAll() : activityRepository.findAllVisibleToUser(userId);
        }

        if (eagerload) {
            return activityRepository.fetchBagRelationships(activities);
        }
        return activities;
    }

    /**
     * {@code GET  /activities/:id} : get the "id" activity.
     *
     * @param id the id of the activity to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the activity, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/activities/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable Long id) {
        log.debug("REST request to get Activity : {}", id);
        Optional<Activity> activity = activityRepository.findOneWithEagerRelationships(id);
        activity.ifPresent(entityAccessService::assertCanRead);
        return ResponseUtil.wrapOrNotFound(activity);
    }

    /**
     * {@code DELETE  /activities/:id} : delete the "id" activity.
     *
     * @param id the id of the activity to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/activities/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        log.debug("REST request to delete Activity : {}", id);
        Activity existing = activityRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        entityAccessService.assertCanWrite(existing);
        activityDeletionService.deleteActivity(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
