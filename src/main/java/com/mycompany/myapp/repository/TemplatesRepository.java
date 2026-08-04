package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Templates;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT t FROM Templates t WHERE t.owner IS NULL OR t.owner.id = :userId")
    List<Templates> findAllVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Templates t WHERE t.id = :id AND (t.owner IS NULL OR t.owner.id = :userId)")
    Optional<Templates> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);
}
