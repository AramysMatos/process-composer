package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Guidelines;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT g FROM Guidelines g WHERE g.owner IS NULL OR g.owner.id = :userId")
    List<Guidelines> findAllVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT g FROM Guidelines g WHERE g.id = :id AND (g.owner IS NULL OR g.owner.id = :userId)")
    Optional<Guidelines> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);
}
