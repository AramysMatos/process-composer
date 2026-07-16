package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Tools;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Tools entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ToolsRepository extends ToolsRepositoryWithBagRelationships, JpaRepository<Tools, Long> {
    default Optional<Tools> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Tools> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Tools> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }
}
