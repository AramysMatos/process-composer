package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Guidelines;
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
public class GuidelinesRepositoryWithBagRelationshipsImpl implements GuidelinesRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Guidelines> fetchBagRelationships(Optional<Guidelines> guidelines) {
        return guidelines.map(this::fetchActivities);
    }

    @Override
    public Page<Guidelines> fetchBagRelationships(Page<Guidelines> guidelines) {
        return new PageImpl<>(fetchBagRelationships(guidelines.getContent()), guidelines.getPageable(), guidelines.getTotalElements());
    }

    @Override
    public List<Guidelines> fetchBagRelationships(List<Guidelines> guidelines) {
        return Optional.of(guidelines).map(this::fetchActivities).orElse(Collections.emptyList());
    }

    Guidelines fetchActivities(Guidelines result) {
        return entityManager
            .createQuery(
                "select guidelines from Guidelines guidelines left join fetch guidelines.activities where guidelines is :guidelines",
                Guidelines.class
            )
            .setParameter("guidelines", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Guidelines> fetchActivities(List<Guidelines> guidelines) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, guidelines.size()).forEach(index -> order.put(guidelines.get(index).getId(), index));
        List<Guidelines> result = entityManager
            .createQuery(
                "select distinct guidelines from Guidelines guidelines left join fetch guidelines.activities where guidelines in :guidelines",
                Guidelines.class
            )
            .setParameter("guidelines", guidelines)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
