package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Activity;
import com.mycompany.myapp.repository.ActivityRepository;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles activity deletion. Parent/child links are removed without deleting related activities.
 */
@Service
@Transactional
public class ActivityDeletionService {

    private static final String ENTITY_NAME = "activity";

    private final ActivityRepository activityRepository;

    public ActivityDeletionService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public void deleteActivity(Long id) {
        Activity activity = activityRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        unlinkActivityHierarchy(Set.of(activity.getId()));
        clearOtherRelationships(activity);
        activityRepository.delete(activity);
    }

    public void deleteActivitiesByPhaseId(Long phaseId) {
        List<Activity> activities = activityRepository.findByPhase_Id(phaseId);
        if (activities.isEmpty()) {
            return;
        }

        Set<Long> activityIds = activities.stream().map(Activity::getId).collect(Collectors.toSet());
        unlinkActivityHierarchy(activityIds);
        activities.forEach(this::clearOtherRelationships);
        activityRepository.deleteAll(activities);
    }

    /**
     * Removes hierarchy links involving the given activities. Related activities are kept.
     */
    private void unlinkActivityHierarchy(Collection<Long> activityIds) {
        List<Activity> parents = activityRepository.findBySubActivities_IdIn(activityIds);
        for (Activity parent : parents) {
            parent.getSubActivities().removeIf(child -> activityIds.contains(child.getId()));
        }
        activityRepository.saveAll(parents);

        List<Activity> children = activityRepository.findByPredecessorActivities_IdIn(activityIds);
        for (Activity child : children) {
            child.getPredecessorActivities().removeIf(parent -> activityIds.contains(parent.getId()));
        }
        activityRepository.saveAll(children);
    }

    private void clearOtherRelationships(Activity activity) {
        activity.getSubActivities().clear();
        activity.getPredecessorActivities().clear();

        new HashSet<>(activity.getTasks()).forEach(task -> task.removeActivities(activity));

        activity.getTemplates().clear();
        activity.getGuidelines().clear();
        activity.getParticipantRoles().clear();
        activity.getResponsibleRoles().clear();
        activity.getTools().clear();
        activity.getRequiredArtifacts().clear();
        activity.getProducedArtifacts().clear();
    }
}
