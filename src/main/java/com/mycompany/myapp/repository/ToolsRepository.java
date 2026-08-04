package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Tools;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT t FROM Tools t WHERE t.owner IS NULL OR t.owner.id = :userId")
    List<Tools> findAllVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT t FROM Tools t WHERE t.id = :id AND (t.owner IS NULL OR t.owner.id = :userId)")
    Optional<Tools> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);
}
