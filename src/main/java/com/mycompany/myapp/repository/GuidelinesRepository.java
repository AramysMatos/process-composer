package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Guidelines;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Guidelines entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GuidelinesRepository extends GuidelinesRepositoryWithBagRelationships, JpaRepository<Guidelines, Long> {
    default Optional<Guidelines> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Guidelines> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Guidelines> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
