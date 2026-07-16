package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Templates;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Templates entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TemplatesRepository extends TemplatesRepositoryWithBagRelationships, JpaRepository<Templates, Long> {
    default Optional<Templates> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Templates> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Templates> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
