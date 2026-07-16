package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Tools;
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
public class ToolsRepositoryWithBagRelationshipsImpl implements ToolsRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Tools> fetchBagRelationships(Optional<Tools> tools) {
        return tools.map(this::fetchActivities);
    }

    @Override
    public Page<Tools> fetchBagRelationships(Page<Tools> tools) {
        return new PageImpl<>(fetchBagRelationships(tools.getContent()), tools.getPageable(), tools.getTotalElements());
    }

    @Override
    public List<Tools> fetchBagRelationships(List<Tools> tools) {
        return Optional.of(tools).map(this::fetchActivities).orElse(Collections.emptyList());
    }

    Tools fetchActivities(Tools result) {
        return entityManager
            .createQuery("select tools from Tools tools left join fetch tools.activities where tools is :tools", Tools.class)
            .setParameter("tools", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Tools> fetchActivities(List<Tools> tools) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, tools.size()).forEach(index -> order.put(tools.get(index).getId(), index));
        List<Tools> result = entityManager
            .createQuery("select distinct tools from Tools tools left join fetch tools.activities where tools in :tools", Tools.class)
            .setParameter("tools", tools)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
