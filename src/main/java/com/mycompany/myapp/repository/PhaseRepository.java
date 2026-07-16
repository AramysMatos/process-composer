package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Phase;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Phase entity.
 */
@Repository
public interface PhaseRepository extends JpaRepository<Phase, Long> {
    List<Phase> findByProcess_Id(Long processId);

    default Optional<Phase> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Phase> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Phase> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select distinct phase from Phase phase left join fetch phase.process",
        countQuery = "select count(distinct phase) from Phase phase"
    )
    Page<Phase> findAllWithToOneRelationships(Pageable pageable);

    @Query("select distinct phase from Phase phase left join fetch phase.process")
    List<Phase> findAllWithToOneRelationships();

    @Query("select phase from Phase phase left join fetch phase.process where phase.id =:id")
    Optional<Phase> findOneWithToOneRelationships(@Param("id") Long id);
}
