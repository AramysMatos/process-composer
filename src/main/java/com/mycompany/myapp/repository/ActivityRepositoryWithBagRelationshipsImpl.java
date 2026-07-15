package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Activity;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.annotations.QueryHints;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class ActivityRepositoryWithBagRelationshipsImpl implements ActivityRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Activity> fetchBagRelationships(Optional<Activity> activity) {
        return activity
            .map(this::fetchSubActivities)
            .map(this::fetchTemplates)
            .map(this::fetchGuidelines)
            .map(this::fetchParticipantRoles)
            .map(this::fetchResponsibleRoles)
            .map(this::fetchTools)
            .map(this::fetchRequiredArtifacts)
            .map(this::fetchProducedArtifacts);
    }

    @Override
    public Page<Activity> fetchBagRelationships(Page<Activity> activities) {
        return new PageImpl<>(fetchBagRelationships(activities.getContent()), activities.getPageable(), activities.getTotalElements());
    }

    @Override
    public List<Activity> fetchBagRelationships(List<Activity> activities) {
        return Optional
            .of(activities)
            .map(this::fetchSubActivities)
            .map(this::fetchTemplates)
            .map(this::fetchGuidelines)
            .map(this::fetchParticipantRoles)
            .map(this::fetchResponsibleRoles)
            .map(this::fetchTools)
            .map(this::fetchRequiredArtifacts)
            .map(this::fetchProducedArtifacts)
            .orElse(Collections.emptyList());
    }

    Activity fetchSubActivities(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.subActivities where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchSubActivities(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.subActivities where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchTemplates(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.templates where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchTemplates(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.templates where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchGuidelines(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.guidelines where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchGuidelines(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.guidelines where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchParticipantRoles(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.participantRoles where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchParticipantRoles(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.participantRoles where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchResponsibleRoles(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.responsibleRoles where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchResponsibleRoles(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.responsibleRoles where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchTools(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.tools where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchTools(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.tools where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchRequiredArtifacts(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.requiredArtifacts where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchRequiredArtifacts(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.requiredArtifacts where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }

    Activity fetchProducedArtifacts(Activity result) {
        return entityManager
            .createQuery(
                "select activity from Activity activity left join fetch activity.producedArtifacts where activity is :activity",
                Activity.class
            )
            .setParameter("activity", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Activity> fetchProducedArtifacts(List<Activity> activities) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, activities.size()).forEach(index -> order.put(activities.get(index).getId(), index));
        List<Activity> result = entityManager
            .createQuery(
                "select distinct activity from Activity activity left join fetch activity.producedArtifacts where activity in :activities",
                Activity.class
            )
            .setParameter("activities", activities)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
