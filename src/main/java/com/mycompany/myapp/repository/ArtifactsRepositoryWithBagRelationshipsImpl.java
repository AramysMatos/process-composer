package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Artifacts;
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
public class ArtifactsRepositoryWithBagRelationshipsImpl implements ArtifactsRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Artifacts> fetchBagRelationships(Optional<Artifacts> artifacts) {
        return artifacts.map(this::fetchTemplates);
    }

    @Override
    public Page<Artifacts> fetchBagRelationships(Page<Artifacts> artifacts) {
        return new PageImpl<>(fetchBagRelationships(artifacts.getContent()), artifacts.getPageable(), artifacts.getTotalElements());
    }

    @Override
    public List<Artifacts> fetchBagRelationships(List<Artifacts> artifacts) {
        return Optional.of(artifacts).map(this::fetchTemplates).orElse(Collections.emptyList());
    }

    Artifacts fetchTemplates(Artifacts result) {
        return entityManager
            .createQuery(
                "select artifacts from Artifacts artifacts left join fetch artifacts.templates where artifacts is :artifacts",
                Artifacts.class
            )
            .setParameter("artifacts", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Artifacts> fetchTemplates(List<Artifacts> artifacts) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, artifacts.size()).forEach(index -> order.put(artifacts.get(index).getId(), index));
        List<Artifacts> result = entityManager
            .createQuery(
                "select distinct artifacts from Artifacts artifacts left join fetch artifacts.templates where artifacts in :artifacts",
                Artifacts.class
            )
            .setParameter("artifacts", artifacts)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
