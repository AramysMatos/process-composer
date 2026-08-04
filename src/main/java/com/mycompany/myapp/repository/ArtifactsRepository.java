package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Artifacts;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Artifacts entity.
 *
 * When extending this class, extend ArtifactsRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface ArtifactsRepository extends ArtifactsRepositoryWithBagRelationships, JpaRepository<Artifacts, Long> {
    default Optional<Artifacts> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Artifacts> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Artifacts> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    @Query("SELECT a FROM Artifacts a WHERE a.owner IS NULL OR a.owner.id = :userId")
    List<Artifacts> findAllVisibleToUser(@Param("userId") Long userId);

    @Query("SELECT a FROM Artifacts a WHERE a.id = :id AND (a.owner IS NULL OR a.owner.id = :userId)")
    Optional<Artifacts> findVisibleToUser(@Param("id") Long id, @Param("userId") Long userId);
}
